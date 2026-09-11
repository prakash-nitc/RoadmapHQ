// Helpers every suite needs on top of lib.mjs (which stays exactly as specified).

import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const rawBase = process.env.URL ?? 'http://localhost:3000/';
export const BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
export const SHOTS = process.env.SHOTS ?? '';

export const url = (path) => new URL(path.replace(/^\//, ''), BASE).href;

export const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The suites run against their own throwaway database, prisma/test.db. Real data
// (Turso) and the old local copy (prisma/dev.db) are never touched: seeding is aimed
// at test.db here, and serve.mjs points the dev server at the same file.
export const TEST_DATABASE_URL = 'file:./test.db';

// `npm run db:reset` against prisma/test.db. Returns the seeded problem count.
export function seedTestDb() {
  const out = execSync('npm run db:reset 2>&1', {
    cwd: '..',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  }).toString();
  if (!/SQLite database "test\.db"/.test(out)) {
    throw new Error(`db:reset did not report prisma/test.db as its target — stopping.\n${out}`);
  }
  return seededProblemCount(out);
}

// What a human would read. innerText applies CSS text-transform, so labels
// styled `uppercase` come back uppercase — match those with the /i flag.
export const mainText = (page) => page.locator('main').innerText();

export const BROKEN_VALUE = /NaN|undefined|Invalid Date/;

// Most pages load data client-side or re-render after a server action, so a
// single read races the render. Poll <main> until it says what we expect.
// 30s leaves room for `next dev` compiling a route on first hit.
export async function waitForMain(page, re, timeout = 30_000) {
  try {
    await page.waitForFunction(
      ([src, flags]) => new RegExp(src, flags).test(document.querySelector('main')?.innerText ?? ''),
      [re.source, re.flags],
      { timeout },
    );
  } catch {
    const text = await mainText(page).catch(() => '<no <main> on page>');
    throw new Error(`timed out waiting for <main> to match ${re}\n--- <main> text, first 800 chars ---\n${text.slice(0, 800)}`);
  }
}

// check() for "this sentence is on screen", showing what was there instead.
export function matchCheck(check, label, text, re) {
  const ok = re.test(text);
  check(label, ok, true);
  if (!ok) console.log(`           ${re} not in <main>; it starts: ${JSON.stringify(text.slice(0, 300))}`);
}

// check() that a page reads the same twice, showing the first line that differs.
export function sameText(check, label, actual, expected) {
  const ok = actual === expected;
  check(label, ok, true);
  if (!ok) {
    const a = actual.split('\n');
    const e = expected.split('\n');
    let i = a.findIndex((line, n) => line !== e[n]);
    if (i === -1) i = Math.min(a.length, e.length);
    console.log(`           first difference at line ${i + 1}:` +
      `\n             before: ${JSON.stringify(e[i])}\n             after:  ${JSON.stringify(a[i])}`);
  }
}

// Server-rendered text is on screen before React hydrates, and a click that
// lands before hydration is silently dropped. Let the page go network-idle
// (hydration plus its first server actions) before clicking.
export const settle = (page) => page.waitForLoadState('networkidle');

// Before a screenshot, also let things stop moving: finite CSS entrance
// animations (the aurora loops forever, so infinite ones are skipped), and
// Recharts, which animates SVG paths frame by frame and starts the donut
// ~400ms late — shot at network-idle, the Analytics donut is still empty.
export async function settleVisuals(page) {
  await settle(page);
  await page.waitForFunction(
    () => !document.getAnimations().some((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations !== Infinity),
    null,
    { timeout: 5_000 },
  ).catch(() => {});
  const started = Date.now();
  let last = null;
  let quietSince = started;
  while (Date.now() - started < 6_000) {
    const markup = await page.evaluate(() => [...document.querySelectorAll('main svg')].map((s) => s.innerHTML.length).join(','));
    if (markup !== last) {
      last = markup;
      quietSince = Date.now();
    } else if (Date.now() - quietSince >= 900) {
      break;
    }
    await page.waitForTimeout(150);
  }
}

// Playwright's fullPage capture paints beyond the viewport, and Chromium mis-draws
// tall frosted-glass (backdrop-filter) cards that way: the Problems table came out
// shifted under the sidebar and faded while the live page was fine. Instead, stretch
// the viewport to the page height so the browser lays out and paints the whole page
// for real, capture, then put the 1440x900 viewport back for the assertions.
const MAX_CAPTURE_HEIGHT = 16_000;

export async function shoot(page, name) {
  if (!SHOTS) return;
  await settleVisuals(page);
  mkdirSync(SHOTS, { recursive: true });
  const path = join(SHOTS, `${name}.png`);
  const viewport = page.viewportSize();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  if (height > MAX_CAPTURE_HEIGHT) {
    await page.screenshot({ path, fullPage: true });
  } else {
    try {
      if (height > viewport.height) {
        await page.setViewportSize({ width: viewport.width, height });
        await settleVisuals(page); // a resize re-renders responsive charts
      }
      await page.screenshot({ path });
    } finally {
      await page.setViewportSize(viewport);
    }
  }
  console.log(`    shot  ${path}`);
}

// For UI that goes away on its own (the celebration toast dismisses itself after
// 8s, sooner than shoot() finishes settling): capture the viewport as it is now.
export async function shootNow(page, name) {
  if (!SHOTS) return;
  mkdirSync(SHOTS, { recursive: true });
  const path = join(SHOTS, `${name}.png`);
  await page.screenshot({ path });
  console.log(`    shot  ${path}`);
}

// `npm run db:reset` output ends with the seed's own row counts.
export function seededProblemCount(resetOutput) {
  const m = String(resetOutput).match(/Problems:\s+(\d+)/);
  if (!m) throw new Error(`could not find "Problems: N" in db:reset output:\n${resetOutput}`);
  return Number(m[1]);
}

// Tripwire — call after seeding and BEFORE any click that writes. A dev server
// started with a plain `npm run dev` reads the production Turso database from
// .env, and one started on dev.db shows the old local copy; both fail this. Reads only.
export async function assertSeededLocalDb(page, expectedProblems) {
  await page.goto(url('problems'));
  // The list first paints "across 0 problems / Solved 0" before data arrives,
  // which would pass a naive check against the wrong database. Wait for real data.
  await waitForMain(page, /across\s+[1-9]\d*\s+problems?/i);
  const text = await mainText(page);
  const total = Number(text.match(/across\s+(\d+)\s+problems?/i)?.[1]);
  const solved = Number(text.match(/solved\s+(\d+)\s+remaining/i)?.[1]);
  if (total !== expectedProblems || solved !== 0) {
    throw new Error(
      `REFUSING TO CONTINUE — after seeding the app shows ${total} problems / ${solved} solved, ` +
      `but the fresh seed has ${expectedProblems} / 0. The dev server is not reading prisma/test.db. ` +
      `Start it with \`node serve.mjs\` (a plain \`npm run dev\` reads production). Nothing was written.`,
    );
  }
  console.log(`    ok    tripwire: app is on the seeded test database (${total} problems, 0 solved)`);
}
