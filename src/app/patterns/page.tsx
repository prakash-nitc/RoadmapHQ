import { getPatterns } from "@/lib/actions";
import { PatternsClient } from "@/components/patterns/PatternsClient";

export const dynamic = "force-dynamic";

export default async function PatternsPage() {
  const patterns = await getPatterns();

  const serialized = patterns.map((p) => {
    const totalVids = p.videos.length;
    const watchedVids = p.videos.filter((v) => v.watched).length;
    const totalProbs = p.problems.length;
    const solvedProbs = p.problems.filter((pr) =>
      ["SOLVED", "REVISED", "MASTERED"].includes(pr.status)
    ).length;
    const masteredProbs = p.problems.filter((pr) => pr.status === "MASTERED").length;
    const avgMastery =
      totalProbs > 0
        ? p.problems.reduce((s, pr) => s + pr.masteryScore, 0) / totalProbs
        : 0;

    const videoProgress = totalVids > 0 ? watchedVids / totalVids : 0;
    const problemProgress = totalProbs > 0 ? solvedProbs / totalProbs : 0;
    const completion = Math.round(
      (videoProgress * 40 + problemProgress * 60) * 100
    ) / 100;

    return {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      order: p.order,
      status: p.status,
      totalVideos: totalVids,
      watchedVideos: watchedVids,
      totalProblems: totalProbs,
      solvedProblems: solvedProbs,
      masteredProblems: masteredProbs,
      mastery: Math.round(avgMastery),
      completion,
    };
  });

  const overallMastery =
    serialized.length > 0
      ? Math.round(
          serialized.reduce((s, p) => s + p.mastery, 0) / serialized.length
        )
      : 0;

  return <PatternsClient patterns={serialized} overallMastery={overallMastery} />;
}
