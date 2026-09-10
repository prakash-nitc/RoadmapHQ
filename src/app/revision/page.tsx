import { getPatternPracticeData, getRecognitionSummary } from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [data, recognition] = await Promise.all([
    getPatternPracticeData(),
    getRecognitionSummary(),
  ]);
  return <RevisionCornerClient data={data} recognition={recognition} />;
}
