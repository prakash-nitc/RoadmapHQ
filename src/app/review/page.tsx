import { getWeeklyReview } from "@/lib/actions";
import { WeeklyReviewClient } from "@/components/review/WeeklyReviewClient";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const data = await getWeeklyReview();
  return <WeeklyReviewClient data={data} />;
}
