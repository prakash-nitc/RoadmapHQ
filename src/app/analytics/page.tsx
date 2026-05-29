import { getAnalyticsData } from "@/lib/actions";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsClient data={data} />;
}
