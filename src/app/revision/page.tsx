import { getPatternPracticeData } from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const data = await getPatternPracticeData();
  return <RevisionCornerClient data={data} />;
}
