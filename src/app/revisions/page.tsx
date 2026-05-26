import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, addDays, format } from "date-fns";
import { RevisionClient } from "@/components/revisions/RevisionClient";

export const dynamic = "force-dynamic";

export default async function RevisionsPage() {
  const today = startOfDay(new Date());
  const next7Days = addDays(today, 7);

  const [todayRevisions, upcomingRevisions, completedRevisions] = await Promise.all([
    prisma.revision.findMany({
      where: { scheduledDate: { lte: endOfDay(today) }, status: "PENDING" },
      include: { problem: { include: { pattern: true } } },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.revision.findMany({
      where: {
        scheduledDate: { gt: endOfDay(today), lte: next7Days },
        status: "PENDING",
      },
      include: { problem: { include: { pattern: true } } },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.revision.findMany({
      where: { status: { in: ["COMPLETED", "SKIPPED"] } },
      include: { problem: { include: { pattern: true } } },
      orderBy: { completedDate: "desc" },
      take: 20,
    }),
  ]);

  const serialize = (revs: typeof todayRevisions) =>
    revs.map((r) => ({
      id: r.id,
      problemTitle: r.problem.title,
      problemUrl: r.problem.url,
      patternName: r.problem.pattern.name,
      scheduledDate: format(r.scheduledDate, "MMM dd"),
      completedDate: r.completedDate ? format(r.completedDate, "MMM dd") : null,
      revisionNumber: r.revisionNumber,
      status: r.status,
    }));

  return (
    <RevisionClient
      todayRevisions={serialize(todayRevisions)}
      upcomingRevisions={serialize(upcomingRevisions)}
      completedRevisions={serialize(completedRevisions)}
    />
  );
}
