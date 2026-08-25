/**
 * Phase-3: pattern-level Practice schedule. Adds Pattern columns + the
 * UserSettings.propeersUrl column to Turso, seeds the Propeers mapping, and
 * backfills scheduling (patterns with any solved problem become due now).
 *
 *   $env:TURSO_DATABASE_URL=...; $env:TURSO_AUTH_TOKEN=...
 *   npm run migrate:pattern-practice
 */

import { createClient } from "@libsql/client";
import { PROPEERS_MAP } from "./propeers-map";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  const c = createClient({ url, authToken });

  const alters = [
    `ALTER TABLE "Pattern" ADD COLUMN "revStep" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "Pattern" ADD COLUMN "revNextDueAt" DATETIME`,
    `ALTER TABLE "Pattern" ADD COLUMN "revLastDoneAt" DATETIME`,
    `ALTER TABLE "Pattern" ADD COLUMN "revFailCount" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "Pattern" ADD COLUMN "propeersTopic" TEXT`,
    `ALTER TABLE "Pattern" ADD COLUMN "propeersSub" TEXT`,
    `ALTER TABLE "UserSettings" ADD COLUMN "propeersUrl" TEXT`,
  ];
  for (const a of alters) {
    try {
      await c.execute(a);
      console.log("✓ " + a.slice(0, 62));
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      if (m.includes("duplicate column")) console.log("• skip (exists)");
      else throw e;
    }
  }

  // Seed the Propeers mapping.
  let mapped = 0;
  for (const [name, m] of Object.entries(PROPEERS_MAP)) {
    const r = await c.execute({
      sql: `UPDATE "Pattern" SET propeersTopic=?, propeersSub=? WHERE name=?`,
      args: [m.topic, m.sub, name],
    });
    if (r.rowsAffected > 0) mapped++;
  }
  console.log(`\n✓ Mapped ${mapped} patterns to Propeers topics.`);

  // Backfill: any pattern with >=1 solved problem is due for practice now.
  const now = new Date().toISOString();
  const r = await c.execute({
    sql: `UPDATE "Pattern" SET revStep=1, revNextDueAt=?, revLastDoneAt=?
          WHERE revStep=0 AND id IN (
            SELECT DISTINCT patternId FROM "Problem"
            WHERE status IN ('SOLVED','REVISED','MASTERED')
          )`,
    args: [now, now],
  });
  console.log(`✅ Backfilled ${r.rowsAffected} patterns into the practice schedule (due now).`);

  c.close();
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
