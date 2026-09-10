/**
 * Adds RevDrillLog.source (DRILL | TEST) to Turso. Idempotent.
 *
 *   $env:TURSO_DATABASE_URL=...; $env:TURSO_AUTH_TOKEN=...
 *   npm run migrate:test-source
 */
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  const c = createClient({ url, authToken });

  try {
    await c.execute(
      `ALTER TABLE "RevDrillLog" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'DRILL'`
    );
    console.log("✓ Added RevDrillLog.source");
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    if (m.includes("duplicate column")) console.log("• source already exists — skipped");
    else throw e;
  }

  c.close();
  console.log("✅ Done.");
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
