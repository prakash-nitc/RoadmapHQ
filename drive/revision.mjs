// Revision: the recognition drill loads, answering a rep advances it, and a
// finished drill's score survives a reload; a pattern practiced from the queue
// moves and stays moved.

import { readFileSync } from 'node:fs';
import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, BROKEN_VALUE, matchCheck,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

// Drill choices are pattern names from the DB, which come from this seed file.
const PATTERNS = [...readFileSync(new URL('../prisma/seed-data/patterns.ts', import.meta.url), 'utf8')
  .matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
const REPS = 10; // the shortest drill the setup screen offers
const PRACTICE = 'Two Pointers';
const BANDS = ['OA-ready recognition', 'Functional, but slow', 'This is your bottleneck', 'Run a repair sprint'];
const bandFor = (acc) => (acc >= 85 ? BANDS[0] : acc >= 65 ? BANDS[1] : acc >= 45 ? BANDS[2] : BANDS[3]);
const STATUSES = ['Not started', 'Due', 'Shaky', 'Solid'];
const COUNTS = /(\d+) solid · (\d+) shaky · (\d+) due/;
const FEEDBACK = /^(Correct|Not quite|Time's up)$/m;
const counterRe = (i) => new RegExp(`(^|\\s)${i} / ${REPS}(\\s|$)`);

console.log('== revision');
const total = seedTestDb();

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

const inMain = page.locator('main');
const button = (name) => inMain.getByRole('button', { name, exact: true });
// The four answer buttons are whichever buttons on screen carry a pattern name.
const choices = async () => (await inMain.getByRole('button').allInnerTexts())
  .map((s) => s.trim()).filter((s) => PATTERNS.includes(s));
const feedback = async () => (await mainText(page)).match(FEEDBACK)?.[1];
const patternRow = (name) => page.locator(`[data-pattern-row="${name}"]`);
const chipOf = async (name) => {
  const lines = (await patternRow(name).innerText()).split('\n').map((l) => l.trim());
  return STATUSES.find((s) => lines.some((l) => l === s || l.startsWith(`${s} ·`)));
};
const startDrill = async () => {
  await page.goto(url('revision/drill'));
  await waitForMain(page, /how many reps\?/i);
  await settle(page); // the setup screen is server-rendered; wait for hydration before clicking
  await button(String(REPS)).click();
  await button('Start drill').click();
  await waitForMain(page, counterRe(1));
};

try {
  await assertSeededLocalDb(page, total);

  console.log('  -- drill: setup loads');
  await page.goto(url('revision/drill'));
  await waitForMain(page, /how many reps\?/i);
  let text = await mainText(page);
  matchCheck(check, 'setup screen names the drill', text, /Pattern Recognition Drill/);
  check('rep counts and start button offered', await Promise.all(['10', '15', '25', 'Start drill'].map((n) => button(n).count())), [1, 1, 1, 1]);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'revision-1-drill-setup');

  console.log('  -- drill: answering a rep advances it');
  await startDrill();
  let opts = await choices();
  check('rep 1 offers four distinct real pattern names', [opts.length, new Set(opts).size], [4, 4]);
  check('no Next button before answering', await button('Next').count(), 0);
  await button(opts[0]).click();
  await waitForMain(page, FEEDBACK);
  check('answering gives Correct / Not quite feedback', ['Correct', 'Not quite'].includes(await feedback()), true);
  check('answering locks all four choices', await Promise.all(opts.map((o) => button(o).isDisabled())), [true, true, true, true]);
  await shoot(page, 'revision-2-drill-answered');
  await button('Next').click();
  await waitForMain(page, counterRe(2));
  check('Next moves to rep 2 with the feedback cleared', await feedback(), undefined);

  console.log('  -- drill: an abandoned drill is not recorded');
  await page.reload();
  await waitForMain(page, /how many reps\?/i);
  check('reloading mid-drill drops back to setup (reps live in memory only)', counterRe(2).test(await mainText(page)), false);
  await page.goto(url('revision'));
  await waitForMain(page, /Choose a pattern to revise/);
  matchCheck(check, 'Revision Corner still has no recognition score', await mainText(page), /Start your first drill →/);

  console.log(`  -- drill: a finished ${REPS}-rep drill is recorded`);
  await startDrill();
  let correct = 0;
  for (let i = 1; i <= REPS; i++) {
    await waitForMain(page, counterRe(i));
    opts = await choices();
    if (opts.length !== 4) throw new Error(`rep ${i}: expected 4 pattern choices, got ${JSON.stringify(opts)}`);
    await button(opts[0]).click();
    await waitForMain(page, FEEDBACK);
    if ((await feedback()) === 'Correct') correct++;
    await button(i < REPS ? 'Next' : 'See score').click();
  }
  await waitForMain(page, /identified correctly/);
  const acc = Math.round((correct / REPS) * 100);
  text = await mainText(page);
  check('scorecard accuracy matches the answers given', text.match(/recognition score\s+(\d+)%/i)?.[1], String(acc));
  check('scorecard tally', text.match(/(\d+) \/ (\d+) identified correctly/)?.slice(1), [String(correct), String(REPS)]);
  check('scorecard band for that accuracy', BANDS.find((b) => text.includes(b)), bandFor(acc));
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'revision-3-drill-score');

  const score = async () => (await mainText(page)).match(/(\d+)% recognition · last 30d/)?.[1];
  await page.goto(url('revision'));
  await waitForMain(page, /recognition · last 30d/);
  check('Revision Corner shows the recorded accuracy', await score(), String(acc));
  await page.reload();
  await waitForMain(page, /recognition · last 30d/);
  check('recorded accuracy survives a reload', await score(), String(acc));

  console.log('  -- practice queue: a practiced pattern moves and stays moved');
  await waitForMain(page, /Choose a pattern to revise/);
  check('queue counts start empty', (await mainText(page)).match(COUNTS)?.slice(1), ['0', '0', '0']);
  check(`"${PRACTICE}" starts Not started`, await chipOf(PRACTICE), 'Not started');

  await settle(page); // server-rendered page; wait for hydration before clicking
  await patternRow(PRACTICE).getByRole('button', { name: 'Practice', exact: true }).click();
  await waitForMain(page, /Refresh the concept/);
  matchCheck(check, 'practice opens on the chosen pattern', await mainText(page), new RegExp(`Pattern practice\\s+1/1[\\s\\S]*${PRACTICE}`));
  await button('Refreshed — next').click();
  await waitForMain(page, /Solve 2–3 fresh problems/);
  matchCheck(check, 'fresh step copes with no Propeers mapping (the local seed has none)', await mainText(page), /No Propeers track for this pattern/);
  await button('Solved a few — next').click();
  await waitForMain(page, /Cold re-solve 1–2 CORE anchors/);
  matchCheck(check, 'cold step copes with no CORE anchors (the local seed has none)', await mainText(page), /No CORE anchors tagged for this pattern yet\./);
  await button('Done — how did it feel?').click();
  await waitForMain(page, new RegExp(`How solid is ${PRACTICE}\\?`));
  await shoot(page, 'revision-4-practice-verdict');
  await button('Solid — space it out').click();
  await waitForMain(page, /Practice done for today/);
  await button('Done').click();
  await waitForMain(page, /1 solid · 0 shaky · 0 due/);

  const queue = async () => ({ counts: (await mainText(page)).match(COUNTS)?.slice(1), chip: await chipOf(PRACTICE) });
  const moved = await queue();
  check('practicing moves the pattern to Solid', moved, { counts: ['1', '0', '0'], chip: 'Solid' });
  await shoot(page, 'revision-5-queue-after-practice');
  await page.reload();
  await waitForMain(page, /Choose a pattern to revise/);
  check('the move survives a reload', await queue(), moved);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(await mainText(page)), false);
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== revision: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
