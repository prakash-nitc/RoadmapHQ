import { getTestStatus } from "@/lib/revision-actions";
import { InterleavedTest } from "@/components/revision/InterleavedTest";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const { lastTestAt, due } = await getTestStatus();
  return (
    <InterleavedTest
      lastTestAt={lastTestAt ? lastTestAt.toISOString() : null}
      stale={due}
    />
  );
}
