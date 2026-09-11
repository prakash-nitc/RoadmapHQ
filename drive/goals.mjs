// Goals: the page loads real numbers, and a saved placement date persists,
// unlocks the reality check straight away, and drives the verdict's day count
// and required pace.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, BROKEN_VALUE,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

const DAYS_OUT = 30;
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const targetDay = new Date();
targetDay.setDate(targetDay.getDate() + DAYS_OUT);
const TARGET = ymd(targetDay);
const SEED_PROBLEMS_TARGET = 3; // dailyTargetProblems in prisma/seed.ts

// The verdict panel: title, one-line blurb, then "To finish by <date> (<n> days):".
const VERDICT = /(On track if you hit your targets|On track|Behind schedule)\s*\n[^\n]+\n\s*To finish by\s+(\S+)\s+\((\d+) days?\):/;

console.log('== goals');
const total = seedTestDb();

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

const dateInput = page.locator('input[type="date"]'); // date inputs have no ARIA role
const verdict = async () => {
  const text = await mainText(page);
  const m = text.match(VERDICT);
  return {
    title: m?.[1],
    finishBy: m?.slice(2, 4),
    problemsNeeded: text.match(/Problems\s+([\d.]+)\s*\/day\s+You need/i)?.[1],
  };
};

// The Reality check card shows a prompt until a placement date is saved.
const realityCheck = async () => {
  const text = await mainText(page);
  return {
    locked: /Set your placement date above to unlock the reality check\./.test(text),
    daysLeft: text.match(/Days left\s+(\d+)/i)?.[1] ?? null,
  };
};

try {
  await assertSeededLocalDb(page, total);

  console.log('  -- loads real numbers');
  await page.goto(url('goals'));
  await waitForMain(page, /Problems remaining\s+\d+/i);
  let text = await mainText(page);
  check('problems remaining is the whole seed', text.match(/Problems remaining\s+(\d+)/i)?.[1], String(total));
  check('no placement date yet, so no verdict', /To finish by/.test(text), false);
  check('and the reality check asks for a date', await realityCheck(), { locked: true, daysLeft: null });
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'goals-1-fresh');

  console.log(`  -- a placement date ${DAYS_OUT} days out`);
  await settle(page);
  await dateInput.fill(TARGET);
  await waitForMain(page, /To finish by/);
  const needed = String(Math.ceil((total / DAYS_OUT) * 10) / 10);
  const expected = { title: 'Behind schedule', finishBy: [TARGET, String(DAYS_OUT)], problemsNeeded: needed };
  check(`verdict: ${DAYS_OUT} days, ${needed} problems/day needed vs the ${SEED_PROBLEMS_TARGET}/day target`, await verdict(), expected);
  await page.getByRole('button', { name: 'Save settings', exact: true }).click();
  await waitForMain(page, /(^|\s)Saved(\s|$)/);
  const unlocked = { locked: false, daysLeft: String(DAYS_OUT) };
  check('saving unlocks the reality check right away, on the same day count', await realityCheck(), unlocked);
  await shoot(page, 'goals-2-date-saved');

  await page.reload();
  await waitForMain(page, /To finish by/);
  check('the date survives a reload', await dateInput.inputValue(), TARGET);
  check('and so does the verdict', await verdict(), expected);
  check('and the reality check', await realityCheck(), unlocked);
  text = await mainText(page);
  check('no NaN / undefined / Invalid Date after reload', BROKEN_VALUE.test(text), false);
  await shoot(page, 'goals-3-after-reload');
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== goals: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
