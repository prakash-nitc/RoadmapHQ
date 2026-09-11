// Journal: an entry saves and survives a reload, and each day keeps its own entry.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, BROKEN_VALUE, escapeRe,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

// The page heads each day as "Friday, September 11, 2026".
const longDate = (d) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const TODAY_ENTRY = 'Harness entry for today: the sliding window shrinks when the constraint breaks.';
const YESTERDAY_ENTRY = 'Harness entry for yesterday: two pointers want sorted input.';

console.log('== journal');
const total = seedTestDb();

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

const box = page.getByRole('textbox');
const counted = (n) => new RegExp(`(^|\\s)${n} characters`);
// What a person reads: the day in the header, the counter, and the text in the box.
const shown = async () => {
  const text = await mainText(page);
  return {
    day: [today, yesterday].map(longDate).find((d) => text.includes(d)),
    characters: text.match(/(\d+) characters/)?.[1],
    entry: await box.inputValue(),
  };
};
const save = async () => {
  await page.getByRole('button', { name: 'Save entry', exact: true }).click();
  await waitForMain(page, /✓ Saved/);
};

try {
  await assertSeededLocalDb(page, total);

  console.log("  -- today's entry saves and survives a reload");
  await page.goto(url('journal'));
  await waitForMain(page, new RegExp(escapeRe(longDate(today))));
  await settle(page);
  check('opens on today with an empty entry', await shown(), { day: longDate(today), characters: '0', entry: '' });
  check('Next day is disabled on today', await page.getByRole('button', { name: 'Next day' }).isDisabled(), true);
  await box.fill(TODAY_ENTRY);
  check('the counter follows typing', (await shown()).characters, String(TODAY_ENTRY.length));
  await save();
  await shoot(page, 'journal-1-saved');
  await page.reload();
  await waitForMain(page, counted(TODAY_ENTRY.length));
  const todayShown = { day: longDate(today), characters: String(TODAY_ENTRY.length), entry: TODAY_ENTRY };
  check("today's entry is back after a reload", await shown(), todayShown);

  console.log('  -- another day keeps its own entry');
  await settle(page);
  await page.getByRole('button', { name: 'Previous day' }).click();
  await waitForMain(page, counted(0));
  await settle(page); // the day's entry loads after the header changes
  check('yesterday starts empty', await shown(), { day: longDate(yesterday), characters: '0', entry: '' });
  check('Next day is enabled on yesterday', await page.getByRole('button', { name: 'Next day' }).isEnabled(), true);
  await box.fill(YESTERDAY_ENTRY);
  await save();
  await page.getByRole('button', { name: 'Next day' }).click();
  await waitForMain(page, counted(TODAY_ENTRY.length));
  check("back on today shows today's entry, not yesterday's", await shown(), todayShown);

  await page.reload();
  await waitForMain(page, counted(TODAY_ENTRY.length));
  await settle(page);
  await page.getByRole('button', { name: 'Previous day' }).click();
  await waitForMain(page, counted(YESTERDAY_ENTRY.length));
  const text = await mainText(page);
  check("yesterday's entry survives a reload too", await shown(), { day: longDate(yesterday), characters: String(YESTERDAY_ENTRY.length), entry: YESTERDAY_ENTRY });
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'journal-2-yesterday');
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== journal: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
