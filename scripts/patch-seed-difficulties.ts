/**
 * Patch prisma/seed-data/problems.ts: for any problem line that has a URL
 * in the difficulty map but no `difficulty:` field, insert it before
 * `platform:`. Idempotent — lines that already have a difficulty are skipped.
 *
 *   npm run patch:seed-difficulties
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { DIFFICULTY_BY_URL } from "./difficulty-map";

const seedPath = join(__dirname, "..", "prisma", "seed-data", "problems.ts");
const lines = readFileSync(seedPath, "utf-8").split("\n");

let patched = 0;
const out = lines.map((line) => {
  if (!line.includes("url:") || line.includes("difficulty:")) return line;
  const urlMatch = line.match(/url: "([^"]+)"/);
  if (!urlMatch) return line;
  const diff = DIFFICULTY_BY_URL[urlMatch[1]];
  if (!diff) return line;
  // Insert `difficulty: "X", ` right before `platform:`
  patched++;
  return line.replace(/(platform:)/, `difficulty: "${diff}", $1`);
});

writeFileSync(seedPath, out.join("\n"));
console.log(`✅ Patched ${patched} problems in seed file.`);
