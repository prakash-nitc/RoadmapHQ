import { getRevisionOverview, getAnchorList } from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [overview, anchors] = await Promise.all([
    getRevisionOverview(),
    getAnchorList(),
  ]);
  return <RevisionCornerClient overview={overview} anchors={anchors} />;
}
