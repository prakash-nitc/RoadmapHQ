import { getPatternById } from "@/lib/actions";
import { notFound } from "next/navigation";
import { PatternDetailClient } from "@/components/patterns/PatternDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatternDetailPage({ params }: Props) {
  const { id } = await params;
  const pattern = await getPatternById(id);

  if (!pattern) return notFound();

  const watchedVids = pattern.videos.filter((v) => v.watched).length;
  const solvedProbs = pattern.problems.filter((p) =>
    ["SOLVED", "REVISED", "MASTERED"].includes(p.status)
  ).length;

  const serialized = {
    ...pattern,
    startedAt: pattern.startedAt?.toISOString() ?? null,
    completedAt: pattern.completedAt?.toISOString() ?? null,
    videos: pattern.videos.map((v) => ({
      ...v,
      watchedAt: v.watchedAt?.toISOString() ?? null,
    })),
    problems: pattern.problems.map((p) => ({
      ...p,
      solvedAt: p.solvedAt?.toISOString() ?? null,
    })),
    notes: pattern.notes
      ? {
          id: pattern.notes.id,
          patternId: pattern.notes.patternId,
          keyLearnings: pattern.notes.keyLearnings,
          mistakes: pattern.notes.mistakes,
          revisionNotes: pattern.notes.revisionNotes,
        }
      : null,
    watchedVids,
    solvedProbs,
  };

  return <PatternDetailClient pattern={serialized} />;
}
