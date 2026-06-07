/**
 * Import scripts/data-snapshot.json into the Turso database.
 * Requires TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in your environment.
 *
 *   $env:TURSO_DATABASE_URL="libsql://..."
 *   $env:TURSO_AUTH_TOKEN="..."
 *   npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/import-turso.ts
 *
 * Idempotent: safe to re-run. Existing rows are upserted by id.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl) {
    throw new Error("TURSO_DATABASE_URL is required");
  }

  const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
  const prisma = new PrismaClient({ adapter });

  const snapshotPath = join(__dirname, "data-snapshot.json");
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf-8"));
  console.log(`📥 Importing snapshot from ${snapshot.exportedAt}`);

  // Helper: revive date strings into Date objects.
  function revive<T extends Record<string, unknown>>(obj: T): T {
    const out: Record<string, unknown> = { ...obj };
    for (const k of Object.keys(out)) {
      const v = out[k];
      if (
        typeof v === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)
      ) {
        out[k] = new Date(v);
      }
    }
    return out as T;
  }

  // Order matters: parents before children to satisfy foreign keys.
  console.log("→ Patterns");
  for (const p of snapshot.patterns) {
    const data = revive(p);
    await prisma.pattern.upsert({
      where: { id: p.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.patterns.length} patterns`);

  console.log("→ Videos");
  for (const v of snapshot.videos) {
    const data = revive(v);
    await prisma.video.upsert({
      where: { id: v.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.videos.length} videos`);

  console.log("→ Problems");
  for (const p of snapshot.problems) {
    const data = revive(p);
    await prisma.problem.upsert({
      where: { id: p.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.problems.length} problems`);

  console.log("→ Revisions");
  for (const r of snapshot.revisions) {
    const data = revive(r);
    await prisma.revision.upsert({
      where: { id: r.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.revisions.length} revisions`);

  console.log("→ Study sessions");
  for (const s of snapshot.studySessions) {
    const data = revive(s);
    await prisma.studySession.upsert({
      where: { id: s.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.studySessions.length} sessions`);

  console.log("→ Daily logs");
  for (const l of snapshot.dailyLogs) {
    const data = revive(l);
    await prisma.dailyLog.upsert({
      where: { id: l.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.dailyLogs.length} daily logs`);

  console.log("→ Pattern notes");
  for (const n of snapshot.patternNotes) {
    const data = revive(n);
    await prisma.patternNote.upsert({
      where: { id: n.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.patternNotes.length} notes`);

  console.log("→ User settings");
  for (const s of snapshot.userSettings) {
    const data = revive(s);
    await prisma.userSettings.upsert({
      where: { id: s.id },
      update: data,
      create: data,
    });
  }
  console.log(`   ${snapshot.userSettings.length} settings rows`);

  console.log("\n✅ Import complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Import failed:", e);
  process.exit(1);
});
