import { getStatsData } from "@/lib/revision-actions";
import { StatsClient } from "@/components/revision/StatsClient";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const data = await getStatsData();
  return (
    <StatsClient
      health={data.health}
      recognition={data.recognition}
      testAccuracy={data.testAccuracy}
      avgHealth={data.avgHealth}
      lastTestAt={data.lastTestAt ? data.lastTestAt.toISOString() : null}
    />
  );
}
