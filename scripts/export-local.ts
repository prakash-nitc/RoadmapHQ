/**
 * Export the local SQLite database to JSON at scripts/data-snapshot.json.
 * Run BEFORE deploying so your current progress can be carried into Turso.
 *
 *   npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/export-local.ts
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Exporting local database...");

  const [
    patterns,
    videos,
    problems,
    revisions,
    studySessions,
    dailyLogs,
    patternNotes,
    userSettings,
  ] = await Promise.all([
    prisma.pattern.findMany(),
    prisma.video.findMany(),
    prisma.problem.findMany(),
    prisma.revision.findMany(),
    prisma.studySession.findMany(),
    prisma.dailyLog.findMany(),
    prisma.patternNote.findMany(),
    prisma.userSettings.findMany(),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    patterns,
    videos,
    problems,
    revisions,
    studySessions,
    dailyLogs,
    patternNotes,
    userSettings,
  };

  const outPath = join(__dirname, "data-snapshot.json");
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

  console.log(`✅ Snapshot written to ${outPath}`);
  console.log(`   Patterns: ${patterns.length}`);
  console.log(`   Videos: ${videos.length}`);
  console.log(`   Problems: ${problems.length}`);
  console.log(`   Revisions: ${revisions.length}`);
  console.log(`   StudySessions: ${studySessions.length}`);
  console.log(`   DailyLogs: ${dailyLogs.length}`);
  console.log(`   PatternNotes: ${patternNotes.length}`);
  console.log(`   UserSettings: ${userSettings.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Export failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
