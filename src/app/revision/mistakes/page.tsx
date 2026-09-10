import { prisma } from "@/lib/db";
import { getMistakes } from "@/lib/revision-actions";
import { MistakeLog } from "@/components/revision/MistakeLog";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const [mistakes, patterns] = await Promise.all([
    getMistakes(),
    prisma.pattern.findMany({ select: { name: true }, orderBy: { order: "asc" } }),
  ]);
  return (
    <MistakeLog
      initialMistakes={mistakes.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
      patternNames={patterns.map((p) => p.name)}
    />
  );
}
