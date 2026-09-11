import {
  getPatternPracticeData,
  getRecognitionSummary,
  getTestStatus,
} from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [data, recognition, test] = await Promise.all([
    getPatternPracticeData(),
    getRecognitionSummary(),
    getTestStatus(),
  ]);
  return (
    <RevisionCornerClient
      data={data}
      recognition={recognition}
      lastTestAt={test.lastTestAt ? test.lastTestAt.toISOString() : null}
      testDue={test.due}
    />
  );
}
