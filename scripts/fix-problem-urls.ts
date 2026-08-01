/**
 * One-off: strip the broken "-description/" suffix from LeetCode problem URLs
 * in the live database. The canonical URL is /problems/{slug}/ but many rows
 * stored /problems/{slug}-description/ which 404s.
 *
 *   $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="..."
 *   npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/fix-problem-urls.ts
 *
 * Runs against Turso if TURSO_* is set, otherwise the local SQLite file.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function makeClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (url) {
    const adapter = new PrismaLibSQL({ url, authToken: token });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

async function main() {
  const prisma = makeClient();
  const problems = await prisma.problem.findMany({
    select: { id: true, url: true },
  });

  let fixed = 0;
  for (const p of problems) {
    if (!p.url) continue;
    // Turn ".../problems/{slug}-description/" into ".../problems/{slug}/"
    const cleaned = p.url.replace(/-description\/?$/, "/");
    if (cleaned !== p.url) {
      await prisma.problem.update({
        where: { id: p.id },
        data: { url: cleaned },
      });
      fixed++;
    }
  }

  console.log(`✅ Fixed ${fixed} problem URLs (of ${problems.length} total).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Fix failed:", e);
  process.exit(1);
});
