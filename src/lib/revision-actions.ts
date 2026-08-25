"use server";

import { prisma } from "@/lib/db";

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
