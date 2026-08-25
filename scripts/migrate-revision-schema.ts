/**
 * Apply the Phase-1 revision-protocol schema delta to Turso:
 *   - new Problem columns (tier, anchorInsight, failCount, lastReviewedAt, mixedSetPassed)
 *   - Assessment + AssessmentResult tables
 * Idempotent: tolerates "duplicate column" / "already exists".
 *
 *   $env:TURSO_DATABASE_URL=...; $env:TURSO_AUTH_TOKEN=...
 *   npm run migrate:revision
 */

import { createClient } from "@libsql/client";

const STATEMENTS = [
  `ALTER TABLE "Problem" ADD COLUMN "tier" TEXT`,
  `ALTER TABLE "Problem" ADD COLUMN "anchorInsight" TEXT`,
  `ALTER TABLE "Problem" ADD COLUMN "failCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Problem" ADD COLUMN "lastReviewedAt" DATETIME`,
  `ALTER TABLE "Problem" ADD COLUMN "mixedSetPassed" INTEGER NOT NULL DEFAULT 0`,
  `CREATE TABLE IF NOT EXISTS "Assessment" (
     "id" TEXT NOT NULL PRIMARY KEY,
     "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "completedAt" DATETIME,
     "note" TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS "AssessmentResult" (
     "id" TEXT NOT NULL PRIMARY KEY,
     "assessmentId" TEXT NOT NULL,
     "problemId" TEXT NOT NULL,
     "patternId" TEXT NOT NULL,
     "passed" INTEGER NOT NULL,
     CONSTRAINT "AssessmentResult_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
     CONSTRAINT "AssessmentResult_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AssessmentResult_assessmentId_problemId_key" ON "AssessmentResult"("assessmentId", "problemId")`,
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  const client = createClient({ url, authToken });

  for (const stmt of STATEMENTS) {
    try {
      await client.execute(stmt);
      console.log("✓ " + stmt.split("\n")[0].slice(0, 70));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate column") || msg.includes("already exists")) {
        console.log("• skip (exists): " + stmt.split("\n")[0].slice(0, 60));
      } else {
        throw e;
      }
    }
  }
  console.log("\n✅ Revision schema migrated to Turso.");
  client.close();
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
