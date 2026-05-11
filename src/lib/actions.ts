"use server";

import { prisma } from "@/lib/db";
import {
  startOfDay,
  endOfDay,
  subDays,
  differenceInDays,
  differenceInCalendarDays,
  format,
} from "date-fns";

// ═══════════════════════════════════════════════════════════════
// DASHBOARD DATA
// ═══════════════════════════════════════════════════════════════

export async function getDashboardData() {
  const today = startOfDay(new Date());

  // Fetch all core counts
  const [
    totalPatterns,
    completedPatterns,
    totalVideos,
    watchedVideos,
    totalProblems,
    solvedProblems,
    settings,
    todayRevisions,
    allDailyLogs,
    totalStudyMins,
  ] = await Promise.all([
    prisma.pattern.count(),
    prisma.pattern.count({ where: { status: "COMPLETED" } }),
    prisma.video.count(),
    prisma.video.count({ where: { watched: true } }),
    prisma.problem.count(),
    prisma.problem.count({
      where: { status: { in: ["SOLVED", "REVISED", "MASTERED"] } },
    }),
    prisma.userSettings.findFirst({ where: { id: "default" } }),
    prisma.revision.findMany({
      where: {
        scheduledDate: { lte: endOfDay(today) },
        status: "PENDING",
      },
      include: { problem: { include: { pattern: true } } },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.dailyLog.findMany({
      where: { isStudyDay: true },
      orderBy: { date: "asc" },
    }),
    prisma.studySession.aggregate({ _sum: { durationMins: true } }),
  ]);

  // Calculate streaks
  const { currentStreak, longestStreak, totalStudyDays } =
    calculateStreaks(allDailyLogs);

  // Calculate day number using calendar days (not 24h periods), so the
  // counter ticks at midnight regardless of what time of day startDate was set.
  const startDate = settings?.startDate ?? new Date();
  const dayNumber = differenceInCalendarDays(new Date(), startDate) + 1;

  // Calculate placement readiness per pattern
  const patternsWithStats = await prisma.pattern.findMany({
    include: {
      videos: true,
      problems: true,
    },
    orderBy: { order: "asc" },
  });

  const patternReadiness = patternsWithStats.map((p) => {
    const totalVids = p.videos.length;
    const watchedVids = p.videos.filter((v) => v.watched).length;
    const totalProbs = p.problems.length;
    const solvedProbs = p.problems.filter((pr) =>
      ["SOLVED", "REVISED", "MASTERED"].includes(pr.status)
    ).length;
    const avgMastery =
      totalProbs > 0
        ? p.problems.reduce((sum, pr) => sum + pr.masteryScore, 0) / totalProbs
        : 0;

    const videoProgress = totalVids > 0 ? watchedVids / totalVids : 0;
    const problemProgress = totalProbs > 0 ? solvedProbs / totalProbs : 0;
    const completion = Math.round(
      (videoProgress * 40 + problemProgress * 60) * 100
    ) / 100;

    return {
      id: p.id,
      name: p.name,
      completion,
      mastery: Math.round(avgMastery),
      totalVideos: totalVids,
      watchedVideos: watchedVids,
      totalProblems: totalProbs,
      solvedProblems: solvedProbs,
      status: p.status,
    };
  });

  // Overall placement readiness
  const overallReadiness =
    patternReadiness.length > 0
      ? Math.round(
          patternReadiness.reduce((sum, p) => sum + p.completion, 0) /
            patternReadiness.length
        )
      : 0;

  // ─── Pace projection ────────────────────────────────────────
  // Smart window: divide by the actual span of activity, not always 30.
  // Floor at 7 so a single big session doesn't claim absurd daily rates;
  // cap at 30 so old bursts don't distort the recent picture.
  const thirtyDaysAgo = subDays(today, 30);
  const recentSolves = await prisma.problem.findMany({
    where: {
      solvedAt: { gte: thirtyDaysAgo, not: null },
      status: { in: ["SOLVED", "REVISED", "MASTERED"] },
    },
    select: { solvedAt: true },
    orderBy: { solvedAt: "asc" },
  });
  const recentSolved = recentSolves.length;

  const oldestRecent = recentSolves[0]?.solvedAt;
  const daysOfActivity = oldestRecent
    ? Math.max(1, differenceInDays(today, startOfDay(oldestRecent)) + 1)
    : 0;
  const paceWindow = Math.min(30, Math.max(daysOfActivity, 7));
  const problemsPerDay = recentSolved > 0 ? recentSolved / paceWindow : 0;

  // Target-based pace from the user's daily target (always positive when set).
  const targetPerDay = settings?.dailyTargetProblems ?? 0;

  // Use the BETTER of observed and target — observed for users hitting target,
  // target for users still ramping up. Either way the date is actionable.
  const effectivePerDay = Math.max(problemsPerDay, targetPerDay);

  const remainingProblems = totalProblems - solvedProblems;
  const estimatedDaysRemaining =
    effectivePerDay > 0
      ? Math.ceil(remainingProblems / effectivePerDay)
      : null;
  const projectedDate = estimatedDaysRemaining
    ? format(
        new Date(Date.now() + estimatedDaysRemaining * 86400000),
        "MMM dd, yyyy"
      )
    : "Not enough data";

  // Separate "current pace" projection (observed only) for transparency.
  const paceOnlyDays =
    problemsPerDay > 0 ? Math.ceil(remainingProblems / problemsPerDay) : null;
  const paceOnlyDate = paceOnlyDays
    ? format(new Date(Date.now() + paceOnlyDays * 86400000), "MMM dd, yyyy")
    : null;

  // Heatmap data (last 365 days)
  const yearAgo = subDays(today, 365);
  const heatmapLogs = await prisma.dailyLog.findMany({
    where: { date: { gte: yearAgo } },
    orderBy: { date: "asc" },
  });

  // Heatmap intensity reflects effort: 1 cell per problem solved.
  // Study-only days (no problems) still register as a "study day" but
  // get the lightest color via the explicit zero count below.
  const heatmapData = heatmapLogs.map((log) => ({
    date: format(log.date, "yyyy-MM-dd"),
    count: log.completedProblems,
    isStudyDay: log.isStudyDay,
  }));

  // Today's revisions completed (for the Today widget — Revise progress)
  const todayRevisionsCompleted = await prisma.revision.count({
    where: {
      completedDate: { gte: today, lt: endOfDay(today) },
      status: "COMPLETED",
    },
  });
  const todayRevisionsDueTotal = await prisma.revision.count({
    where: {
      scheduledDate: { lte: endOfDay(today) },
      status: { in: ["PENDING", "COMPLETED"] },
      OR: [
        { status: "PENDING" },
        { completedDate: { gte: today, lt: endOfDay(today) } },
      ],
    },
  });

  // Next video to watch
  const nextVideo = await prisma.video.findFirst({
    where: { watched: false },
    orderBy: { episodeNumber: "asc" },
    include: { pattern: true },
  });

  // Today's daily log. If it exists but its targets drift from current
  // UserSettings, sync them. This guards against the race where a user
  // changed targets in Goals but today's log was created with older values.
  let todayLog = await prisma.dailyLog.findFirst({
    where: {
      date: {
        gte: today,
        lt: endOfDay(today),
      },
    },
  });
  if (todayLog && settings) {
    const needsSync =
      todayLog.targetVideos !== settings.dailyTargetVideos ||
      todayLog.targetProblems !== settings.dailyTargetProblems ||
      todayLog.targetStudyMins !== settings.dailyTargetStudyMins;
    if (needsSync) {
      todayLog = await prisma.dailyLog.update({
        where: { id: todayLog.id },
        data: {
          targetVideos: settings.dailyTargetVideos,
          targetProblems: settings.dailyTargetProblems,
          targetStudyMins: settings.dailyTargetStudyMins,
        },
      });
    }
  }

  // Last study day (most recent isStudyDay) — used for comeback / missed-day cards.
  const lastStudyLog = await prisma.dailyLog.findFirst({
    where: { isStudyDay: true },
    orderBy: { date: "desc" },
  });
  const lastStudyDayISO = lastStudyLog
    ? format(lastStudyLog.date, "yyyy-MM-dd")
    : null;
  const daysSinceLastStudy = lastStudyLog
    ? differenceInDays(today, startOfDay(lastStudyLog.date))
    : null;

  // Mission complete = the 3 visible tasks (videos + problems + revisions).
  // Study minutes are tracked but not gated on (no UI to log them yet).
  const todayRevisionsRemaining =
    todayRevisionsDueTotal - todayRevisionsCompleted;
  const missionComplete =
    (todayLog?.completedVideos ?? 0) >= (todayLog?.targetVideos ?? 2) &&
    (todayLog?.completedProblems ?? 0) >= (todayLog?.targetProblems ?? 3) &&
    todayRevisionsRemaining <= 0;

  // Tomorrow preview — used when today is complete.
  const tomorrowPattern = patternsWithStats.find(
    (p) => p.status === "IN_PROGRESS"
  );
  const tomorrowNextVideo = tomorrowPattern
    ? tomorrowPattern.videos.find((v) => !v.watched)
    : null;
  const tomorrowUnsolvedCount = tomorrowPattern
    ? tomorrowPattern.problems.filter((p) =>
        ["NOT_STARTED", "ATTEMPTED"].includes(p.status)
      ).length
    : 0;

  return {
    dayNumber,
    currentStreak,
    longestStreak,
    totalStudyDays,
    totalPatterns,
    completedPatterns,
    totalVideos,
    watchedVideos,
    totalProblems,
    solvedProblems,
    totalStudyMins: totalStudyMins._sum.durationMins ?? 0,
    overallReadiness,
    projectedDate,
    paceOnlyDate,
    paceWindow,
    targetPerDay,
    problemsPerDay: Math.round(problemsPerDay * 10) / 10,
    effectivePerDay: Math.round(effectivePerDay * 10) / 10,
    patternReadiness,
    targetDate: settings?.targetDate
      ? format(settings.targetDate, "MMM dd, yyyy")
      : null,
    todayRevisionsCompleted,
    todayRevisionsDueTotal,
    lastStudyDayISO,
    daysSinceLastStudy,
    missionComplete,
    tomorrowPattern: tomorrowPattern
      ? {
          id: tomorrowPattern.id,
          name: tomorrowPattern.name,
        }
      : null,
    tomorrowNextVideo: tomorrowNextVideo
      ? {
          id: tomorrowNextVideo.id,
          episodeNumber: tomorrowNextVideo.episodeNumber,
          title: tomorrowNextVideo.title,
        }
      : null,
    tomorrowUnsolvedCount,
    todayRevisions: todayRevisions.map((r) => ({
      id: r.id,
      problemTitle: r.problem.title,
      patternName: r.problem.pattern.name,
      scheduledDate: r.scheduledDate.toISOString(),
      revisionNumber: r.revisionNumber,
    })),
    heatmapData,
    nextVideo: nextVideo
      ? {
          id: nextVideo.id,
          episodeNumber: nextVideo.episodeNumber,
          title: nextVideo.title,
          patternName: nextVideo.pattern.name,
          url: nextVideo.url,
        }
      : null,
    todayLog: todayLog
      ? {
          targetVideos: todayLog.targetVideos,
          targetProblems: todayLog.targetProblems,
          targetStudyMins: todayLog.targetStudyMins,
          completedVideos: todayLog.completedVideos,
          completedProblems: todayLog.completedProblems,
          completedStudyMins: todayLog.completedStudyMins,
          missionScore: todayLog.missionScore,
        }
      : null,
  };
}

// ═══════════════════════════════════════════════════════════════
// STREAK CALCULATION
// ═══════════════════════════════════════════════════════════════

interface DailyLogForStreak {
  date: Date;
  isStudyDay: boolean;
}

function calculateStreaks(logs: DailyLogForStreak[]) {
  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0 };
  }

  const studyDates = new Set(
    logs
      .filter((l) => l.isStudyDay)
      .map((l) => format(l.date, "yyyy-MM-dd"))
  );

  const totalStudyDays = studyDates.size;

  // Calculate current streak. A streak built up through yesterday stays
  // alive until midnight rolls over today without any activity (Snapchat /
  // Duolingo model). So if today isn't a study day yet, we start counting
  // from yesterday — the streak is "at risk", not broken.
  let currentStreak = 0;
  let checkDate = new Date();
  const todayStr = format(checkDate, "yyyy-MM-dd");
  if (!studyDates.has(todayStr)) {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (studyDates.has(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = Array.from(studyDates).sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      if (differenceInDays(curr, prev) === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  return { currentStreak, longestStreak, totalStudyDays };
}

// ═══════════════════════════════════════════════════════════════
// PATTERNS
// ═══════════════════════════════════════════════════════════════

export async function getPatterns() {
  return prisma.pattern.findMany({
    include: {
      videos: true,
      problems: true,
    },
    orderBy: { order: "asc" },
  });
}

export async function getPatternById(id: string) {
  return prisma.pattern.findUnique({
    where: { id },
    include: {
      videos: { orderBy: { episodeNumber: "asc" } },
      problems: { orderBy: { title: "asc" } },
      notes: true,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// VIDEOS
// ═══════════════════════════════════════════════════════════════

export async function toggleVideoWatched(videoId: string) {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return;

  const newWatched = !video.watched;
  await prisma.video.update({
    where: { id: videoId },
    data: {
      watched: newWatched,
      watchedAt: newWatched ? new Date() : null,
    },
  });

  // Update today's daily log
  await updateTodayLog("video", newWatched ? 1 : -1);
  await maybeCompletePattern(video.patternId);
}

export async function updateVideoUrl(videoId: string, url: string) {
  const clean = url.trim();
  await prisma.video.update({
    where: { id: videoId },
    data: { url: clean.length > 0 ? clean : null },
  });
}

// ═══════════════════════════════════════════════════════════════
// PROBLEMS
// ═══════════════════════════════════════════════════════════════

export async function updateProblemStatus(
  problemId: string,
  status: string
) {
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
  });
  if (!problem) return;

  const wasSolved = ["SOLVED", "REVISED", "MASTERED"].includes(problem.status);
  const isSolved = ["SOLVED", "REVISED", "MASTERED"].includes(status);

  const updateData: Record<string, unknown> = {
    status,
    attempts: { increment: 1 },
  };

  if (status === "SOLVED" && !wasSolved) {
    updateData.solvedAt = new Date();
    updateData.revisionLevel = 1;
    updateData.masteryScore = 20;

    // Schedule first revision (3 days from now)
    await prisma.revision.create({
      data: {
        problemId,
        scheduledDate: new Date(Date.now() + 3 * 86400000),
        revisionNumber: 1,
      },
    });
  }

  await prisma.problem.update({
    where: { id: problemId },
    data: updateData,
  });

  // Update daily log
  if (!wasSolved && isSolved) {
    await updateTodayLog("problem", 1);
  }
  await maybeCompletePattern(problem.patternId);
}

export async function completeRevision(revisionId: string) {
  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
    include: { problem: true },
  });
  if (!revision) return;

  // Mark revision as completed
  await prisma.revision.update({
    where: { id: revisionId },
    data: { status: "COMPLETED", completedDate: new Date() },
  });

  // Update problem mastery
  const newLevel = revision.problem.revisionLevel + 1;
  const newMastery = Math.min(newLevel * 20, 100);
  const newStatus = newMastery >= 100 ? "MASTERED" : "REVISED";

  await prisma.problem.update({
    where: { id: revision.problemId },
    data: {
      revisionLevel: newLevel,
      masteryScore: newMastery,
      status: newStatus,
    },
  });

  // Schedule next revision if applicable
  const intervals = [3, 7, 14, 30, 60];
  const nextRevNum = revision.revisionNumber + 1;
  if (nextRevNum <= intervals.length) {
    const daysFromSolved = intervals
      .slice(0, nextRevNum)
      .reduce((sum, d) => sum + d, 0);
    const scheduledDate = new Date(
      revision.problem.solvedAt!.getTime() + daysFromSolved * 86400000
    );

    await prisma.revision.create({
      data: {
        problemId: revision.problemId,
        scheduledDate,
        revisionNumber: nextRevNum,
      },
    });
  }
}

export async function skipRevision(revisionId: string) {
  await prisma.revision.update({
    where: { id: revisionId },
    data: { status: "SKIPPED" },
  });
}

// ═══════════════════════════════════════════════════════════════
// STUDY SESSIONS
// ═══════════════════════════════════════════════════════════════

export async function startStudySession(patternId?: string) {
  return prisma.studySession.create({
    data: {
      startTime: new Date(),
      patternId,
    },
  });
}

export async function endStudySession(sessionId: string) {
  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
  });
  if (!session) return;

  const endTime = new Date();
  const durationMins = Math.round(
    (endTime.getTime() - session.startTime.getTime()) / 60000
  );

  await prisma.studySession.update({
    where: { id: sessionId },
    data: { endTime, durationMins },
  });

  // Update today's daily log
  await updateTodayLog("study", durationMins);
}

// ═══════════════════════════════════════════════════════════════
// DAILY LOG HELPER
// ═══════════════════════════════════════════════════════════════

async function updateTodayLog(
  type: "video" | "problem" | "study",
  value: number
) {
  const today = startOfDay(new Date());

  const settings = await prisma.userSettings.findFirst({
    where: { id: "default" },
  });

  // Upsert on the unique `date` column to avoid duplicate-day races.
  const log = await prisma.dailyLog.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      targetVideos: settings?.dailyTargetVideos ?? 2,
      targetProblems: settings?.dailyTargetProblems ?? 3,
      targetStudyMins: settings?.dailyTargetStudyMins ?? 120,
    },
  });

  const updateData: Record<string, unknown> = {};

  if (type === "video") {
    updateData.completedVideos = Math.max(0, log.completedVideos + value);
  } else if (type === "problem") {
    updateData.completedProblems = Math.max(
      0,
      log.completedProblems + value
    );
  } else if (type === "study") {
    updateData.completedStudyMins = log.completedStudyMins + value;
  }

  const updated = await prisma.dailyLog.update({
    where: { id: log.id },
    data: updateData,
  });

  // Recalculate mission score and study day
  const isStudyDay =
    updated.completedProblems >= 1 || updated.completedStudyMins >= 30;

  const videoScore =
    updated.targetVideos > 0
      ? Math.min(updated.completedVideos / updated.targetVideos, 1) * 33.33
      : 33.33;
  const problemScore =
    updated.targetProblems > 0
      ? Math.min(updated.completedProblems / updated.targetProblems, 1) *
        33.33
      : 33.33;
  const studyScore =
    updated.targetStudyMins > 0
      ? Math.min(updated.completedStudyMins / updated.targetStudyMins, 1) *
        33.34
      : 33.34;

  await prisma.dailyLog.update({
    where: { id: log.id },
    data: {
      missionScore: Math.round(videoScore + problemScore + studyScore),
      isStudyDay,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// JOURNAL
// ═══════════════════════════════════════════════════════════════

export async function saveJournalEntry(date: Date, entry: string) {
  const dayStart = startOfDay(date);

  await prisma.dailyLog.upsert({
    where: { date: dayStart },
    update: { journalEntry: entry },
    create: {
      date: dayStart,
      journalEntry: entry,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// PATTERN NOTES
// ═══════════════════════════════════════════════════════════════

export async function savePatternNotes(
  patternId: string,
  data: { keyLearnings?: string; mistakes?: string; revisionNotes?: string }
) {
  await prisma.patternNote.upsert({
    where: { patternId },
    update: data,
    create: { patternId, ...data },
  });
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

export async function updateSettings(data: {
  targetDate?: Date;
  dailyTargetVideos?: number;
  dailyTargetProblems?: number;
  dailyTargetStudyMins?: number;
}) {
  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  // Propagate new daily targets to TODAY's log so Today's Mission reflects
  // the change immediately. Historical days stay frozen — their mission
  // scores were earned against the targets that were active then.
  const todayUpdate: Record<string, number> = {};
  if (data.dailyTargetVideos !== undefined)
    todayUpdate.targetVideos = data.dailyTargetVideos;
  if (data.dailyTargetProblems !== undefined)
    todayUpdate.targetProblems = data.dailyTargetProblems;
  if (data.dailyTargetStudyMins !== undefined)
    todayUpdate.targetStudyMins = data.dailyTargetStudyMins;

  if (Object.keys(todayUpdate).length > 0) {
    const today = startOfDay(new Date());
    const todayLog = await prisma.dailyLog.findUnique({
      where: { date: today },
    });
    if (todayLog) {
      await prisma.dailyLog.update({
        where: { date: today },
        data: todayUpdate,
      });
    }
  }
}

export async function getSettings() {
  return prisma.userSettings.findFirst({ where: { id: "default" } });
}

// Lightweight streak query for the sidebar chip — avoids loading full dashboard.
export async function getStreakSummary() {
  const logs = await prisma.dailyLog.findMany({
    where: { isStudyDay: true },
    select: { date: true, isStudyDay: true },
    orderBy: { date: "asc" },
  });
  const today = startOfDay(new Date());
  const todayLog = await prisma.dailyLog.findFirst({
    where: { date: { gte: today, lt: endOfDay(today) } },
  });
  const { currentStreak, longestStreak } = calculateStreaks(logs);
  const isStudyDayToday =
    !!todayLog && (todayLog.completedProblems >= 1 || todayLog.completedStudyMins >= 30);
  return { currentStreak, longestStreak, isStudyDayToday };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN: ADD CONTENT
// ═══════════════════════════════════════════════════════════════

export async function addPattern(data: {
  name: string;
  description?: string;
}) {
  const maxOrder = await prisma.pattern.aggregate({ _max: { order: true } });
  return prisma.pattern.create({
    data: {
      name: data.name,
      description: data.description,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
}

export async function addVideo(data: {
  episodeNumber: number;
  title: string;
  patternId: string;
  duration?: string;
}) {
  return prisma.video.create({ data });
}

export async function addProblem(data: {
  title: string;
  patternId: string;
  difficulty?: string;
  platform: string;
  url: string;
  subPattern?: string;
}) {
  return prisma.problem.create({ data });
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export async function getAnalyticsData() {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 7);
  const fourteenDaysAgo = subDays(today, 14);
  const thirtyDaysAgo = subDays(today, 30);

  const [dailyLogs, allSolvedProblems, patterns] = await Promise.all([
    prisma.dailyLog.findMany({ orderBy: { date: "asc" } }),
    prisma.problem.findMany({
      where: { status: { in: ["SOLVED", "REVISED", "MASTERED"] } },
      select: { difficulty: true, solvedAt: true, masteryScore: true, patternId: true },
    }),
    prisma.pattern.findMany({
      include: { problems: true, videos: true },
      orderBy: { order: "asc" },
    }),
  ]);

  // ─── This week vs last week ────────────────────────────────
  const problemsThisWeek = allSolvedProblems.filter(
    (p) => p.solvedAt && p.solvedAt >= sevenDaysAgo
  ).length;
  const problemsLastWeek = allSolvedProblems.filter(
    (p) =>
      p.solvedAt &&
      p.solvedAt >= fourteenDaysAgo &&
      p.solvedAt < sevenDaysAgo
  ).length;
  const weekDelta = problemsThisWeek - problemsLastWeek;

  // ─── Consistency score (last 30 days) ──────────────────────
  const last30Logs = dailyLogs.filter((l) => l.date >= thirtyDaysAgo);
  const studyDaysInLast30 = last30Logs.filter((l) => l.isStudyDay).length;
  const consistencyScore = Math.round((studyDaysInLast30 / 30) * 100);

  // ─── Best day ever ─────────────────────────────────────────
  const bestDay = dailyLogs.reduce(
    (best, l) =>
      l.completedProblems > best.count
        ? { count: l.completedProblems, date: format(l.date, "MMM dd") }
        : best,
    { count: 0, date: "—" }
  );

  // ─── Daily problems over last 30 days ──────────────────────
  // Build a date-keyed map so missing days show 0.
  const dailyByDate = new Map<string, { problems: number; videos: number; score: number }>();
  dailyLogs.forEach((l) => {
    dailyByDate.set(format(l.date, "yyyy-MM-dd"), {
      problems: l.completedProblems,
      videos: l.completedVideos,
      score: l.missionScore,
    });
  });
  const dailyProblems: { date: string; label: string; problems: number; videos: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    const entry = dailyByDate.get(key);
    dailyProblems.push({
      date: key,
      label: format(d, "MMM d"),
      problems: entry?.problems ?? 0,
      videos: entry?.videos ?? 0,
    });
  }

  // ─── Difficulty mix ────────────────────────────────────────
  const difficultyCounts = { EASY: 0, MEDIUM: 0, HARD: 0, UNKNOWN: 0 };
  allSolvedProblems.forEach((p) => {
    const d = (p.difficulty ?? "UNKNOWN") as keyof typeof difficultyCounts;
    if (d in difficultyCounts) difficultyCounts[d]++;
    else difficultyCounts.UNKNOWN++;
  });

  // ─── Pattern leaderboard ───────────────────────────────────
  const patternStats = patterns.map((p) => {
    const totalProbs = p.problems.length;
    const solvedProbs = p.problems.filter((pr) =>
      ["SOLVED", "REVISED", "MASTERED"].includes(pr.status)
    ).length;
    const avgMastery =
      totalProbs > 0
        ? Math.round(
            p.problems.reduce((s, pr) => s + pr.masteryScore, 0) / totalProbs
          )
        : 0;
    return {
      id: p.id,
      name: p.name,
      mastery: avgMastery,
      solved: solvedProbs,
      total: totalProbs,
    };
  });
  // Sort by mastery desc; pick top 3 strongest and bottom 3 weakest (with any progress).
  const sortedByMastery = [...patternStats].sort((a, b) => b.mastery - a.mastery);
  const strongest = sortedByMastery.slice(0, 3);
  // Weakest = lowest mastery, but skip "empty" patterns (those with 0 problems).
  const weakest = sortedByMastery
    .filter((p) => p.total > 0)
    .slice(-3)
    .reverse();

  // ─── Daily average over their actual activity ──────────────
  const totalSolved = allSolvedProblems.length;
  const firstSolve = allSolvedProblems
    .filter((p) => p.solvedAt)
    .sort((a, b) => (a.solvedAt!.getTime() - b.solvedAt!.getTime()))[0];
  const daysActive = firstSolve?.solvedAt
    ? Math.max(1, differenceInDays(today, startOfDay(firstSolve.solvedAt)) + 1)
    : 0;
  const dailyAverage = daysActive > 0 ? +(totalSolved / daysActive).toFixed(1) : 0;

  // ─── Streaks (existing) ────────────────────────────────────
  const { currentStreak, longestStreak } = calculateStreaks(dailyLogs);

  return {
    // Top stats
    problemsThisWeek,
    problemsLastWeek,
    weekDelta,
    consistencyScore,
    studyDaysInLast30,
    bestDay,
    currentStreak,
    longestStreak,
    dailyAverage,
    daysActive,
    totalSolved,

    // Charts
    dailyProblems,
    difficultyCounts,
    dailyScores: dailyLogs.map((l) => ({
      date: format(l.date, "MMM dd"),
      score: l.missionScore,
      problems: l.completedProblems,
      videos: l.completedVideos,
    })),

    // Pattern leaderboard
    strongest,
    weakest,
  };
}

// ═══════════════════════════════════════════════════════════════
// PROBLEMS LIST (with filters)
// ═══════════════════════════════════════════════════════════════

export async function getProblems(filters?: {
  patternId?: string;
  status?: string;
  difficulty?: string;
  platform?: string;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.patternId) where.patternId = filters.patternId;
  if (filters?.status) where.status = filters.status;
  if (filters?.difficulty) where.difficulty = filters.difficulty;
  if (filters?.platform) where.platform = filters.platform;

  return prisma.problem.findMany({
    where,
    include: { pattern: true },
    orderBy: [{ pattern: { order: "asc" } }, { title: "asc" }],
  });
}

export async function getVideos() {
  return prisma.video.findMany({
    include: { pattern: true },
    orderBy: { episodeNumber: "asc" },
  });
}

// ═══════════════════════════════════════════════════════════════
// PATTERN AUTO-COMPLETION
// ═══════════════════════════════════════════════════════════════

// Re-evaluates a pattern after a video/problem write and updates
// its status (NOT_STARTED → IN_PROGRESS → COMPLETED) plus startedAt /
// completedAt timestamps. Idempotent.
async function maybeCompletePattern(patternId: string) {
  const pattern = await prisma.pattern.findUnique({
    where: { id: patternId },
    include: { videos: true, problems: true },
  });
  if (!pattern) return;

  const totalVids = pattern.videos.length;
  const watchedVids = pattern.videos.filter((v) => v.watched).length;
  const totalProbs = pattern.problems.length;
  const solvedProbs = pattern.problems.filter((p) =>
    ["SOLVED", "REVISED", "MASTERED"].includes(p.status)
  ).length;

  const hasAny = totalVids + totalProbs > 0;
  const allDone =
    hasAny && watchedVids === totalVids && solvedProbs === totalProbs;
  const anyDone = watchedVids > 0 || solvedProbs > 0;

  let nextStatus = pattern.status;
  if (allDone) nextStatus = "COMPLETED";
  else if (anyDone) nextStatus = "IN_PROGRESS";
  else nextStatus = "NOT_STARTED";

  if (nextStatus === pattern.status) return;

  await prisma.pattern.update({
    where: { id: patternId },
    data: {
      status: nextStatus,
      startedAt:
        nextStatus !== "NOT_STARTED" && !pattern.startedAt
          ? new Date()
          : pattern.startedAt,
      completedAt:
        nextStatus === "COMPLETED" ? new Date() : null,
    },
  });
}
