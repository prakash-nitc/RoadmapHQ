import { getRevisionOverview, getAnchorList, getPatternDueQueue } from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [overview, anchors, patternQueue] = await Promise.all([
    getRevisionOverview(),
    getAnchorList(),
    getPatternDueQueue(),
  ]);
  return <RevisionCornerClient overview={overview} anchors={anchors} patternQueue={patternQueue} />;
}
