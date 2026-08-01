/**
 * Fill in difficulty for problems that were seeded without one, using the
 * canonical LeetCode/GfG values in difficulty-map.ts. Only sets difficulty
 * where it is currently NULL — never overwrites an existing label.
 *
 *   $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="..."
 *   npm run fix:difficulties
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { DIFFICULTY_BY_URL } from "./difficulty-map";

function makeClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url) {
    return new PrismaClient({ adapter: new PrismaLibSQL({ url, authToken: token }) });
  }
  return new PrismaClient();
}

async function main() {
  const prisma = makeClient();
  const problems = await prisma.problem.findMany({
    select: { id: true, url: true, difficulty: true, title: true },
  });

  let set = 0;
  let stillMissing: string[] = [];

  for (const p of problems) {
    if (p.difficulty) continue; // never overwrite an existing label
    const diff = DIFFICULTY_BY_URL[p.url];
    if (diff) {
      await prisma.problem.update({ where: { id: p.id }, data: { difficulty: diff } });
      set++;
    } else {
      stillMissing.push(`${p.title} — ${p.url}`);
    }
  }

  console.log(`✅ Set difficulty on ${set} problems.`);
  if (stillMissing.length) {
    console.log(`\n⚠ ${stillMissing.length} still unlabeled (not in map):`);
    stillMissing.forEach((s) => console.log("   " + s));
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
