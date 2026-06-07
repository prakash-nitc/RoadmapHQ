/**
 * Push the current Prisma schema to Turso. Generates CREATE TABLE statements
 * via prisma migrate diff, then executes them against the Turso libSQL endpoint.
 *
 *   $env:TURSO_DATABASE_URL = "libsql://..."
 *   $env:TURSO_AUTH_TOKEN   = "..."
 *   npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/deploy-schema.ts
 *
 * Idempotent — re-running on a populated DB is a no-op (statements use IF NOT EXISTS where possible).
 */

import { execSync } from "child_process";
import { createClient } from "@libsql/client";

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl) throw new Error("TURSO_DATABASE_URL is required");

  console.log("📐 Generating schema SQL from prisma/schema.prisma...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf-8" }
  );

  // Filter out comments, split on semicolons.
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`📡 Connecting to Turso...`);
  const client = createClient({ url: tursoUrl, authToken: tursoToken });

  console.log(`⚙️  Applying ${statements.length} statements...`);
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e: unknown) {
      // Tolerate "already exists" — schema push must be idempotent.
      const msg = e instanceof Error ? e.message : String(e);
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column")
      ) {
        continue;
      }
      console.error("Statement failed:", stmt.slice(0, 80));
      throw e;
    }
  }

  console.log("✅ Schema deployed to Turso.");
  client.close();
}

main().catch((e) => {
  console.error("❌ Schema deploy failed:", e);
  process.exit(1);
});
