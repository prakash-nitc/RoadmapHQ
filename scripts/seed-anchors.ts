/**
 * Apply CORE/SUPPORT tiers + anchor insights (Section 9) to problems,
 * matched by exact title. Runs against Turso if TURSO_* is set, else local.
 *
 *   npm run seed:anchors
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { ANCHORS } from "./anchor-data";

function makeClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url) return new PrismaClient({ adapter: new PrismaLibSQL({ url, authToken: token }) });
  return new PrismaClient();
}

async function main() {
  const prisma = makeClient();
  let set = 0;
  const notFound: string[] = [];

  for (const a of ANCHORS) {
    const matches = await prisma.problem.findMany({ where: { title: a.title } });
    if (matches.length === 0) {
      notFound.push(a.title);
      continue;
    }
    for (const m of matches) {
      await prisma.problem.update({
        where: { id: m.id },
        data: { tier: a.tier, anchorInsight: a.insight },
      });
      set++;
    }
  }

  console.log(`✅ Applied anchors to ${set} problems.`);
  if (notFound.length) {
    console.log(`\n⚠ ${notFound.length} titles from the doc had no DB match:`);
    notFound.forEach((t) => console.log("   " + t));
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
