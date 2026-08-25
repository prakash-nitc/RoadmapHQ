import { getRevisionOverview, getAnchorList, getDueQueue } from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [overview, anchors, dueQueue] = await Promise.all([
    getRevisionOverview(),
    getAnchorList(),
    getDueQueue(),
  ]);
  return <RevisionCornerClient overview={overview} anchors={anchors} dueQueue={dueQueue} />;
}
