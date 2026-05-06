import { PrismaClient } from "@prisma/client";
import { patterns } from "./seed-data/patterns";
import { problems } from "./seed-data/problems";
import { videos } from "./seed-data/videos";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 1. Create Patterns ──────────────────────────────────
  console.log("📦 Creating patterns...");
  const patternMap = new Map<string, string>(); // name → id

  for (const p of patterns) {
    const created = await prisma.pattern.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        description: p.description,
        order: p.order,
      },
    });
    patternMap.set(created.name, created.id);
    console.log(`  ✓ ${created.name}`);
  }

  // ─── 2. Create Videos ────────────────────────────────────
  console.log("\n🎥 Creating videos...");
  let videoCount = 0;

  for (const v of videos) {
    const patternId = patternMap.get(v.patternName);
    if (!patternId) {
      console.warn(`  ⚠ Pattern not found for video: ${v.title} (${v.patternName})`);
      continue;
    }

    // Check if video already exists (by episode number)
    const existing = await prisma.video.findFirst({
      where: { episodeNumber: v.episodeNumber },
    });

    if (!existing) {
      await prisma.video.create({
        data: {
          episodeNumber: v.episodeNumber,
          title: v.title,
          patternId,
          duration: v.duration,
          url: v.url,
        },
      });
      videoCount++;
    } else if (v.url && !existing.url) {
      // Backfill url for existing rows when added later in seed data
      await prisma.video.update({
        where: { id: existing.id },
        data: { url: v.url },
      });
    }
  }
  console.log(`  ✓ ${videoCount} videos created`);

  // ─── 3. Create Problems ──────────────────────────────────
  console.log("\n💻 Creating problems...");
  let problemCount = 0;

  for (const p of problems) {
    const patternId = patternMap.get(p.patternName);
    if (!patternId) {
      console.warn(`  ⚠ Pattern not found for problem: ${p.title} (${p.patternName})`);
      continue;
    }

    // Check if problem already exists (by URL)
    const existing = await prisma.problem.findFirst({
      where: { url: p.url, patternId },
    });

    if (!existing) {
      await prisma.problem.create({
        data: {
          title: p.title,
          patternId,
          subPattern: p.subPattern,
          difficulty: p.difficulty,
          platform: p.platform,
          url: p.url,
          isChallenge: p.isChallenge ?? false,
          isHomework: p.isHomework ?? false,
        },
      });
      problemCount++;
    }
  }
  console.log(`  ✓ ${problemCount} problems created`);

  // ─── 4. Create Default User Settings ─────────────────────
  console.log("\n⚙️  Creating default settings...");
  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      dailyTargetVideos: 2,
      dailyTargetProblems: 3,
      dailyTargetStudyMins: 120,
    },
  });
  console.log("  ✓ Default settings created");

  // ─── Summary ─────────────────────────────────────────────
  const totalPatterns = await prisma.pattern.count();
  const totalVideos = await prisma.video.count();
  const totalProblems = await prisma.problem.count();

  console.log("\n" + "═".repeat(50));
  console.log("🎯 Seed complete!");
  console.log(`   Patterns:  ${totalPatterns}`);
  console.log(`   Videos:    ${totalVideos}`);
  console.log(`   Problems:  ${totalProblems}`);
  console.log("═".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
