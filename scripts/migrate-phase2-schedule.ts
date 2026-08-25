/**
 * Phase 2: add revisionStep + nextDueAt columns to Problem (Turso), then
 * backfill the schedule pipeline so the Due queue is populated immediately.
 *
 * Backfill: every problem currently SOLVED+ enters the elapsed-interval
 * pipeline. SOLVED/REVISED become due today (you haven't been reviewing on
 * schedule, so they're overdue); MASTERED gets a monthly touch.
 *
 *   $env:TURSO_DATABASE_URL=...; $env:TURSO_AUTH_TOKEN=...
 *   npm run migrate:phase2
 */

import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  const c = createClient({ url, authToken });

  const alters = [
    `ALTER TABLE "Problem" ADD COLUMN "revisionStep" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "Problem" ADD COLUMN "nextDueAt" DATETIME`,
  ];
  for (const a of alters) {
    try {
      await c.execute(a);
      console.log("✓ " + a.slice(0, 60));
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      if (m.includes("duplicate column")) console.log("• skip (exists)");
      else throw e;
    }
  }

  const now = new Date().toISOString();
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString();

  // SOLVED -> step 1, due now
  const r1 = await c.execute({
    sql: `UPDATE "Problem" SET revisionStep=1, nextDueAt=?, lastReviewedAt=COALESCE(lastReviewedAt, ?) WHERE status='SOLVED' AND revisionStep=0`,
    args: [now, now],
  });
  // REVISED -> step 2, due now
  const r2 = await c.execute({
    sql: `UPDATE "Problem" SET revisionStep=2, nextDueAt=?, lastReviewedAt=COALESCE(lastReviewedAt, ?) WHERE status='REVISED' AND revisionStep=0`,
    args: [now, now],
  });
  // MASTERED -> step 4, monthly touch
  const r3 = await c.execute({
    sql: `UPDATE "Problem" SET revisionStep=4, nextDueAt=?, lastReviewedAt=COALESCE(lastReviewedAt, ?) WHERE status='MASTERED' AND revisionStep=0`,
    args: [in30, now],
  });

  console.log(
    `\n✅ Backfilled pipeline: ${r1.rowsAffected} solved, ${r2.rowsAffected} revised, ${r3.rowsAffected} mastered.`
  );
  c.close();
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
