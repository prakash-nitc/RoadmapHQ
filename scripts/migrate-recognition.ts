/**
 * Adds the RevDrillLog + RevMistake tables to Turso, copying the exact DDL
 * that Prisma generated in the local SQLite DB (so a later `db push` sees them
 * as in-sync). Idempotent — CREATE TABLE/INDEX IF NOT EXISTS.
 *
 *   $env:TURSO_DATABASE_URL=...; $env:TURSO_AUTH_TOKEN=...
 *   npm run migrate:recognition
 */
import { createClient } from "@libsql/client";

async function main() {
  const local = createClient({ url: "file:./prisma/dev.db" });
  const names = ["RevDrillLog", "RevMistake"];

  const stmts: string[] = [];
  for (const n of names) {
    const t = await local.execute({
      sql: `SELECT sql FROM sqlite_master WHERE type='table' AND name=?`,
      args: [n],
    });
    const idx = await local.execute({
      sql: `SELECT sql FROM sqlite_master WHERE type='index' AND tbl_name=? AND sql IS NOT NULL`,
      args: [n],
    });
    for (const row of t.rows) if (row.sql) stmts.push(String(row.sql));
    for (const row of idx.rows) if (row.sql) stmts.push(String(row.sql));
  }
  local.close();

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  const remote = createClient({ url, authToken });

  for (const s of stmts) {
    // Make each statement idempotent.
    const idempotent = s
      .replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ")
      .replace(/^CREATE INDEX /i, "CREATE INDEX IF NOT EXISTS ")
      .replace(/^CREATE UNIQUE INDEX /i, "CREATE UNIQUE INDEX IF NOT EXISTS ");
    await remote.execute(idempotent);
    console.log("✓ " + idempotent.slice(0, 70).replace(/\s+/g, " "));
  }
  console.log(`\n✅ Applied ${stmts.length} statements to Turso.`);
  remote.close();
}

main().catch((e) => {
  console.error("❌ Failed:", e);
  process.exit(1);
});
