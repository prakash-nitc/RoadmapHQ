import {
  getPatternPracticeData,
  getRecognitionSummary,
  getLastTestAt,
} from "@/lib/revision-actions";
import { RevisionCornerClient } from "@/components/revision/RevisionCornerClient";

export const dynamic = "force-dynamic";

export default async function RevisionCornerPage() {
  const [data, recognition, lastTestAt] = await Promise.all([
    getPatternPracticeData(),
    getRecognitionSummary(),
    getLastTestAt(),
  ]);
  return (
    <RevisionCornerClient
      data={data}
      recognition={recognition}
      lastTestAt={lastTestAt ? lastTestAt.toISOString() : null}
    />
  );
}
