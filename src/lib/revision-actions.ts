"use server";

import { prisma } from "@/lib/db";

// ─── The elapsed-interval schedule (Section 6) ─────────────────
// Absolute plan from Day 0: recall@1, recall@4, cold@10, cold@25, mixed@~monthly.
// We store a step (1..5) and anchor the next due date to the ACTUAL review
// date, so a missed day just shifts the chain forward — it never bunches up
// or breaks. Overdue items surface at the top of the queue.
type ReviewMode = "RECALL" | "SKELETON" | "COLD" | "MIXED";

const STEP_MODE: Record<number, ReviewMode> = {
  1: "RECALL",
  2: "RECALL",
  3: "COLD",
  4: "COLD",
  5: "MIXED",
};

// Days until the NEXT review after completing the given step (advancing +1).
const INTERVAL_AFTER_STEP: Record<number, number> = {
  0: 1, // just solved -> first recall tomorrow
  1: 3, // recall@1 -> recall@4
  2: 6, // recall@4 -> cold@10
  3: 15, // cold@10 -> cold@25
  4: 30, // cold@25 -> monthly mixed
  5: 30, // maintenance loop
};

function modeForStep(step: number): ReviewMode {
  return STEP_MODE[Math.min(Math.max(step, 1), 5)] ?? "RECALL";
}

// ─── The honest mastery ladder (Section 2) ─────────────────────
// Levels are a CURRENT claim about ability, not a record of past work.
// masteryScore is derived from the level so the number reflects retention,
// not sheet completion — this is why an honest tracker reads low.
const LEVELS = ["NOT_STARTED", "ATTEMPTED", "SOLVED", "REVISED", "MASTERED"] as const;
type Level = (typeof LEVELS)[number];

const MASTERY_FOR: Record<Level, number> = {
  NOT_STARTED: 0,
  ATTEMPTED: 15,
  SOLVED: 30, // work done, not yet retained
  REVISED: 65, // passed a notes-closed recall
  MASTERED: 100, // cold re-solve + mixed-set pass
};

function levelIndex(status: string): number {
  const i = LEVELS.indexOf(status as Level);
  return i === -1 ? 0 : i;
}

function demote(status: string): Level {
  const i = levelIndex(status);
  // Revised -> Solved, Solved -> Attempted, Mastered -> Revised.
  // Attempted / Not started can't fall further.
  return LEVELS[Math.max(1, i - 1)] ?? "ATTEMPTED";
}

// ─── Assessment (Section 4) ────────────────────────────────────

export async function startAssessment() {
  // Reuse an in-progress assessment if one exists, so a refresh mid-run
  // doesn't spawn duplicates.
  const existing = await prisma.assessment.findFirst({
    where: { completedAt: null },
    orderBy: { startedAt: "desc" },
  });
  const assessment =
    existing ??
    (await prisma.assessment.create({ data: {} }));

  // The recall set: every problem currently at SOLVED or above (these are
  // the ones that can have decayed). Grouped by pattern for the guided flow.
  const problems = await prisma.problem.findMany({
    where: { status: { in: ["SOLVED", "REVISED", "MASTERED"] } },
    include: { pattern: { select: { id: true, name: true, order: true } } },
    orderBy: [{ pattern: { order: "asc" } }, { title: "asc" }],
  });

  // Which ones already have a result in this assessment (resume support).
  const done = await prisma.assessmentResult.findMany({
    where: { assessmentId: assessment.id },
    select: { problemId: true, passed: true },
  });
  const doneMap = new Map(done.map((d) => [d.problemId, d.passed]));

  return {
    assessmentId: assessment.id,
    problems: problems.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      tier: p.tier,
      anchorInsight: p.anchorInsight,
      difficulty: p.difficulty,
      patternId: p.pattern.id,
      patternName: p.pattern.name,
      patternOrder: p.pattern.order,
      alreadyMarked: doneMap.has(p.id) ? doneMap.get(p.id)! : null,
    })),
  };
}

export async function recordAssessmentResult(
  assessmentId: string,
  problemId: string,
  passed: boolean
) {
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) return;

  await prisma.assessmentResult.upsert({
    where: { assessmentId_problemId: { assessmentId, problemId } },
    update: { passed },
    create: { assessmentId, problemId, patternId: problem.patternId, passed },
  });

  if (passed) {
    // Passed a notes-closed recall -> at least Revised. Never downgrade a
    // Mastered problem for passing.
    const next: Level = problem.status === "MASTERED" ? "MASTERED" : "REVISED";
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        status: next,
        masteryScore: MASTERY_FOR[next],
        failCount: 0,
        lastReviewedAt: new Date(),
      },
    });
  } else {
    // Failed recall demotes and increments the fail counter (Section 2).
    const next = demote(problem.status);
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        status: next,
        masteryScore: MASTERY_FOR[next],
        failCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
    });
  }
}

export async function completeAssessment(assessmentId: string) {
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { completedAt: new Date() },
  });
}

export async function cancelAssessment(assessmentId: string) {
  // Discard an in-progress assessment (results already applied to problems
  // stay — demotions are real; we only drop the empty container if unused).
  const count = await prisma.assessmentResult.count({ where: { assessmentId } });
  if (count === 0) {
    await prisma.assessment.delete({ where: { id: assessmentId } });
  }
}

// ─── Reporting ─────────────────────────────────────────────────

interface PatternRate {
  patternId: string;
  patternName: string;
  order: number;
  total: number;
  failed: number;
  failRate: number; // 0..100
}

async function ratesForAssessment(assessmentId: string): Promise<PatternRate[]> {
  const results = await prisma.assessmentResult.findMany({
    where: { assessmentId },
    include: { problem: { include: { pattern: { select: { name: true, order: true } } } } },
  });
  const byPattern = new Map<string, PatternRate>();
  for (const r of results) {
    const key = r.patternId;
    const cur =
      byPattern.get(key) ??
      {
        patternId: key,
        patternName: r.problem.pattern.name,
        order: r.problem.pattern.order,
        total: 0,
        failed: 0,
        failRate: 0,
      };
    cur.total++;
    if (!r.passed) cur.failed++;
    byPattern.set(key, cur);
  }
  const arr = [...byPattern.values()];
  arr.forEach((p) => (p.failRate = p.total > 0 ? Math.round((p.failed / p.total) * 100) : 0));
  arr.sort((a, b) => b.failRate - a.failRate || a.order - b.order);
  return arr;
}

export async function getRevisionOverview() {
  const [
    inProgress,
    completedAssessments,
    solvedPlus,
    coreCount,
    supportCount,
    learningMode,
    problemsForRetention,
  ] = await Promise.all([
    prisma.assessment.findFirst({ where: { completedAt: null }, orderBy: { startedAt: "desc" } }),
    prisma.assessment.findMany({
      where: { completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 2,
    }),
    prisma.problem.count({ where: { status: { in: ["SOLVED", "REVISED", "MASTERED"] } } }),
    prisma.problem.count({ where: { tier: "CORE" } }),
    prisma.problem.count({ where: { tier: "SUPPORT" } }),
    prisma.problem.findMany({
      where: { failCount: { gte: 2 } },
      include: { pattern: { select: { name: true } } },
      orderBy: { failCount: "desc" },
    }),
    prisma.problem.findMany({
      where: { status: { in: ["SOLVED", "REVISED", "MASTERED"] } },
      select: { status: true },
    }),
  ]);

  const latest = completedAssessments[0] ?? null;
  const previous = completedAssessments[1] ?? null;

  const latestRates = latest ? await ratesForAssessment(latest.id) : [];
  const previousRates = previous ? await ratesForAssessment(previous.id) : [];
  const prevRateMap = new Map(previousRates.map((p) => [p.patternId, p.failRate]));

  // Retention estimate: of everything you've solved, how much is actually
  // held (Revised or Mastered)? This is the "usable problems" number.
  const retained = problemsForRetention.filter((p) =>
    ["REVISED", "MASTERED"].includes(p.status)
  ).length;
  const retentionPct =
    problemsForRetention.length > 0
      ? Math.round((retained / problemsForRetention.length) * 100)
      : 0;

  return {
    hasInProgress: !!inProgress,
    inProgressId: inProgress?.id ?? null,
    latest: latest
      ? {
          id: latest.id,
          date: latest.completedAt,
          rates: latestRates.map((r) => ({
            ...r,
            delta:
              prevRateMap.has(r.patternId)
                ? r.failRate - (prevRateMap.get(r.patternId) ?? 0)
                : null,
          })),
          overallFailRate:
            latestRates.length > 0
              ? Math.round(
                  latestRates.reduce((s, r) => s + r.failed, 0) /
                    Math.max(latestRates.reduce((s, r) => s + r.total, 0), 1) *
                    100
                )
              : 0,
        }
      : null,
    hasPrevious: !!previous,
    solvedPlus,
    retained,
    retentionPct,
    coreCount,
    supportCount,
    learningMode: learningMode.map((p) => ({
      id: p.id,
      title: p.title,
      patternName: p.pattern.name,
      failCount: p.failCount,
      tier: p.tier,
    })),
  };
}

// The anchor list "daily driver" — CORE/SUPPORT per pattern with insights.
export async function getAnchorList() {
  const patterns = await prisma.pattern.findMany({
    where: { problems: { some: { tier: { not: null } } } },
    include: {
      problems: {
        where: { tier: { not: null } },
        orderBy: [{ tier: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          tier: true,
          anchorInsight: true,
          status: true,
          difficulty: true,
          url: true,
          failCount: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });
  return patterns
    .filter((p) => p.problems.length > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      order: p.order,
      core: p.problems.filter((pr) => pr.tier === "CORE"),
      support: p.problems.filter((pr) => pr.tier === "SUPPORT"),
    }));
}

// ─── The daily due queue (Section 7) ───────────────────────────

export async function getDueQueue() {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const due = await prisma.problem.findMany({
    where: {
      revisionStep: { gte: 1 },
      nextDueAt: { lte: endOfToday },
    },
    include: { pattern: { select: { name: true, order: true } } },
    orderBy: { nextDueAt: "asc" }, // most overdue first
  });

  const items = due.map((p) => {
    const daysOverdue = p.nextDueAt
      ? Math.max(0, Math.floor((now.getTime() - p.nextDueAt.getTime()) / 86400000))
      : 0;
    return {
      id: p.id,
      title: p.title,
      url: p.url,
      tier: p.tier,
      anchorInsight: p.anchorInsight,
      difficulty: p.difficulty,
      status: p.status,
      failCount: p.failCount,
      revisionStep: p.revisionStep,
      mode: modeForStep(p.revisionStep),
      patternName: p.pattern.name,
      patternOrder: p.pattern.order,
      daysOverdue,
    };
  });

  // Next upcoming due date (for the "nothing due" state).
  const upcoming = await prisma.problem.findFirst({
    where: { revisionStep: { gte: 1 }, nextDueAt: { gt: endOfToday } },
    orderBy: { nextDueAt: "asc" },
    select: { nextDueAt: true },
  });

  const recallCount = items.filter((i) => i.mode === "RECALL").length;
  const coldCount = items.filter((i) => i.mode === "COLD").length;

  return {
    total: items.length,
    recallCount,
    coldCount,
    items,
    nextDueAt: upcoming?.nextDueAt ?? null,
  };
}

// ─── Pattern Practice: the scheduled unit is the PATTERN ───────
// Session = refresh notes -> solve 2-3 fresh Propeers problems -> cold
// re-solve 1-2 CORE anchors. Elapsed-interval, forgiving of misses.

const PATTERN_INTERVAL: Record<number, number> = {
  0: 3, 1: 3, 2: 7, 3: 14, 4: 30, 5: 30,
};

// Lightweight count for the dashboard nudge — patterns due for practice.
export async function getDueCount() {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return prisma.pattern.count({
    where: { revStep: { gte: 1 }, revNextDueAt: { lte: endOfToday } },
  });
}

export async function getPatternDueQueue() {
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const [due, settings, upcoming] = await Promise.all([
    prisma.pattern.findMany({
      where: { revStep: { gte: 1 }, revNextDueAt: { lte: endOfToday } },
      include: {
        problems: {
          where: { tier: "CORE" },
          select: {
            id: true,
            title: true,
            url: true,
            anchorInsight: true,
            difficulty: true,
            status: true,
          },
          orderBy: { title: "asc" },
        },
        notes: { select: { keyLearnings: true } },
      },
      orderBy: { revNextDueAt: "asc" },
    }),
    prisma.userSettings.findFirst({ where: { id: "default" } }),
    prisma.pattern.findFirst({
      where: { revStep: { gte: 1 }, revNextDueAt: { gt: endOfToday } },
      orderBy: { revNextDueAt: "asc" },
      select: { revNextDueAt: true },
    }),
  ]);

  return {
    total: due.length,
    propeersUrl: settings?.propeersUrl ?? null,
    nextDueAt: upcoming?.revNextDueAt ?? null,
    patterns: due.map((p) => ({
      id: p.id,
      name: p.name,
      order: p.order,
      revStep: p.revStep,
      revFailCount: p.revFailCount,
      propeersTopic: p.propeersTopic,
      propeersSub: p.propeersSub,
      notesHint: p.notes?.keyLearnings ?? null,
      daysOverdue: p.revNextDueAt
        ? Math.max(0, Math.floor((now.getTime() - p.revNextDueAt.getTime()) / 86400000))
        : 0,
      core: p.problems,
    })),
  };
}

// Advance a pattern's practice schedule after a session.
export async function completePatternPractice(
  patternId: string,
  outcome: "solid" | "shaky"
) {
  const p = await prisma.pattern.findUnique({ where: { id: patternId } });
  if (!p) return;
  const now = new Date();

  if (outcome === "solid") {
    const interval = PATTERN_INTERVAL[p.revStep] ?? 30;
    await prisma.pattern.update({
      where: { id: patternId },
      data: {
        revStep: Math.min(p.revStep + 1, 5),
        revFailCount: 0,
        revLastDoneAt: now,
        revNextDueAt: new Date(now.getTime() + interval * 86400000),
      },
    });
  } else {
    // Shaky: come back in 2 days, don't advance, note the wobble.
    await prisma.pattern.update({
      where: { id: patternId },
      data: {
        revFailCount: { increment: 1 },
        revLastDoneAt: now,
        revNextDueAt: new Date(now.getTime() + 2 * 86400000),
      },
    });
  }
}

// Cold re-solve of a CORE anchor inside a session -> honest ladder.
export async function markCoreResolved(problemId: string, passed: boolean) {
  const p = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!p) return;
  const now = new Date();
  if (passed) {
    const next = p.status === "MASTERED" ? "MASTERED" : "REVISED";
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: next, masteryScore: MASTERY_FOR[next], failCount: 0, lastReviewedAt: now },
    });
  } else {
    const demoted = demote(p.status);
    await prisma.problem.update({
      where: { id: problemId },
      data: { status: demoted, masteryScore: MASTERY_FOR[demoted], failCount: { increment: 1 }, lastReviewedAt: now },
    });
  }
}

export async function savePropeersUrl(url: string) {
  const clean = url.trim();
  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: { propeersUrl: clean.length > 0 ? clean : null },
    create: { id: "default", propeersUrl: clean.length > 0 ? clean : null },
  });
}

// Record a review outcome and advance / reset the schedule.
//   passed=true            → advance a step, reschedule further out, mark Revised
//   openedNotes=true       → escape procedure: costs a re-solve (+3d, Attempted)
//   passed=false           → demote a level, reschedule +3 days
export async function reviewProblem(
  problemId: string,
  mode: ReviewMode,
  passed: boolean,
  openedNotes: boolean
) {
  const p = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!p) return;
  const now = new Date();

  if (openedNotes) {
    // Reading the solution is not free — reschedule a re-solve 3 days out,
    // drop to Attempted, back to the start of the recall chain.
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        status: "ATTEMPTED",
        masteryScore: MASTERY_FOR.ATTEMPTED,
        failCount: { increment: 1 },
        revisionStep: 1,
        lastReviewedAt: now,
        nextDueAt: new Date(now.getTime() + 3 * 86400000),
      },
    });
    return;
  }

  if (passed) {
    const newStep = Math.min(p.revisionStep + 1, 5);
    const intervalDays = INTERVAL_AFTER_STEP[p.revisionStep] ?? 30;
    // A passed cold re-solve on a problem already cleared in a mixed set earns
    // Mastered; otherwise a clean recall/cold keeps it at Revised.
    const next =
      mode === "COLD" && p.mixedSetPassed
        ? "MASTERED"
        : p.status === "MASTERED"
        ? "MASTERED"
        : "REVISED";
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        status: next,
        masteryScore: MASTERY_FOR[next as keyof typeof MASTERY_FOR],
        failCount: 0,
        revisionStep: newStep,
        lastReviewedAt: now,
        nextDueAt: new Date(now.getTime() + intervalDays * 86400000),
      },
    });
    return;
  }

  // Plain failure: demote by the ladder, back a step, re-solve 3 days out.
  const demoted = demote(p.status);
  await prisma.problem.update({
    where: { id: problemId },
    data: {
      status: demoted,
      masteryScore: MASTERY_FOR[demoted],
      failCount: { increment: 1 },
      revisionStep: Math.max(1, p.revisionStep - 1),
      lastReviewedAt: now,
      nextDueAt: new Date(now.getTime() + 3 * 86400000),
    },
  });
}
