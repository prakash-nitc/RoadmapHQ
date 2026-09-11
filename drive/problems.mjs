// Problems: the list renders, filtering works without distorting overall
// progress, and marking a problem solved persists.

import { readFileSync } from 'node:fs';
import { open, checker } from './lib.mjs';
import {
  mainText, waitForMain, shoot, BROKEN_VALUE, escapeRe, matchCheck,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

const FIXTURE = 'Triplet Sum to Zero'; // Two Pointers · MEDIUM · unique title in the seed

console.log('== problems');
const total = seedTestDb();

// Expected counts straight from the seed file, applying the seed's own
// de-duplication (url + pattern), so filter checks don't trust the app's numbers.
const seed = [];
const seen = new Set();
for (const line of readFileSync(new URL('../prisma/seed-data/problems.ts', import.meta.url), 'utf8').split('\n')) {
  const title = line.match(/title: "([^"]+)"/)?.[1];
  const pattern = line.match(/patternName: "([^"]+)"/)?.[1];
  const link = line.match(/url: "([^"]+)"/)?.[1];
  if (!title || !pattern || !link || seen.has(`${link}|${pattern}`)) continue;
  seen.add(`${link}|${pattern}`);
  seed.push({ title, difficulty: line.match(/difficulty: "([A-Z]+)"/)?.[1] });
}
if (seed.length !== total) {
  throw new Error(`seed parser out of sync: parsed ${seed.length} problems, db:reset reported ${total}`);
}
const hard = seed.filter((p) => p.difficulty === 'HARD');
const hardSubstring = hard.filter((p) => /substring/i.test(p.title));

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

const table = () => page.getByRole('table');
const row = (title) => page.getByRole('row', { name: new RegExp(escapeRe(title)) });
// What a person reads in a closed <select>: the selected option's label.
const statusOf = (title) => row(title).getByRole('combobox').evaluate((s) => s.selectedOptions[0].textContent);
const columnText = (col) => table().evaluate((t, c) => [...t.tBodies[0].rows].map((r) => r.cells[c].innerText.trim()), col);
const rowCount = () => table().evaluate((t) => t.tBodies[0].rows.length);
const waitForRows = (n) => page.waitForFunction((count) => document.querySelector('table')?.tBodies[0].rows.length === count, n);
const chip = async () => (await mainText(page)).match(/solved\s+\d+\s+remaining\s+\d+/i)?.[0].replace(/\s+/g, ' ').toLowerCase();
// The header always names the whole set; filters add "· showing N".
const header = async () => (await mainText(page)).match(/Curated set across[^\n]*/)?.[0];
const wholeSet = `Curated set across ${total} problems`;
const showing = (n) => `${wholeSet} · showing ${n}`;

try {
  await assertSeededLocalDb(page, total);

  // Find columns by their header text so cell reads survive a column reorder.
  const headers = (await page.getByRole('columnheader').allInnerTexts()).map((h) => h.trim().toLowerCase());
  const col = (name) => {
    const i = headers.indexOf(name);
    if (i < 0) throw new Error(`no "${name}" column; headers are ${JSON.stringify(headers)}`);
    return i;
  };
  const [titleCol, diffCol, masteryCol] = [col('problem'), col('diff'), col('mastery')];
  const masteryOf = async (title) => (await row(title).getByRole('cell').nth(masteryCol).innerText()).trim();

  console.log('  -- list renders');
  let text = await mainText(page);
  check('header names the whole set, with no "showing" count', await header(), wholeSet);
  check('progress chip starts at zero', await chip(), `solved 0 remaining ${total}`);
  check('one table row per seeded problem', await rowCount(), total);
  check(`"${FIXTURE}" is listed exactly once`, await row(FIXTURE).count(), 1);
  check(`"${FIXTURE}" starts as Not started at 0%`, [await statusOf(FIXTURE), await masteryOf(FIXTURE)], ['Not started', '0%']);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'problems-1-list');

  console.log('  -- filtering');
  const difficulty = page.locator('select').filter({ hasText: 'All difficulty' });
  const status = page.locator('select').filter({ hasText: 'All status' });
  const search = page.getByPlaceholder('Search problems...');

  await difficulty.selectOption('HARD');
  await waitForRows(hard.length);
  const diffs = await columnText(diffCol);
  check(`Hard filter shows the ${hard.length} Hard problems in the seed`, diffs.length, hard.length);
  check('every row under the Hard filter reads HARD', [...new Set(diffs)], ['HARD']);
  check('header keeps the whole set and adds the count shown', await header(), showing(hard.length));
  check('a filter does not change overall progress', await chip(), `solved 0 remaining ${total}`);
  await shoot(page, 'problems-2-hard-filter');

  await search.fill('substring');
  await waitForRows(hardSubstring.length);
  check('search narrows within the filter', (await columnText(titleCol)).map((t) => t.split('\n')[0]).sort(),
    hardSubstring.map((p) => p.title).sort());
  check('the "showing" count follows the search too', await header(), showing(hardSubstring.length));

  await search.fill('zz-no-such-problem');
  await waitForMain(page, /No problems match your filters\./);
  check('a search with no match shows the empty state', [await rowCount(), await header()], [0, showing(0)]);

  await search.fill('');
  await difficulty.selectOption('');
  await waitForRows(total);
  check('clearing the filters restores the full list and header', [await rowCount(), await header()], [total, wholeSet]);

  console.log('  -- marking a problem solved');
  await row(FIXTURE).getByRole('combobox').selectOption({ label: 'Solved' });
  await waitForMain(page, new RegExp(`solved\\s+1\\s+remaining\\s+${total - 1}`, 'i'));
  check('progress chip counts the solve', await chip(), `solved 1 remaining ${total - 1}`);
  check(`"${FIXTURE}" now reads Solved at the 30% solved rung`, [await statusOf(FIXTURE), await masteryOf(FIXTURE)], ['Solved', '30%']);

  await status.selectOption('SOLVED');
  await waitForRows(1);
  check('the Solved filter returns exactly that problem', (await columnText(titleCol)).map((t) => t.split('\n')[0]), [FIXTURE]);
  check('under the Solved filter the chip still counts the whole set', await chip(), `solved 1 remaining ${total - 1}`);
  check('and the header still names the whole set', await header(), showing(1));
  await shoot(page, 'problems-3-solved-filter');
  await status.selectOption('');
  await waitForRows(total);

  console.log('  -- the solve survives a reload');
  const snapshot = async () => ({ chip: await chip(), status: await statusOf(FIXTURE), mastery: await masteryOf(FIXTURE) });
  const before = await snapshot();
  await page.reload();
  await waitForMain(page, /across\s+[1-9]\d*\s+problems/i);
  await waitForRows(total);
  check('chip, status and mastery are unchanged after reload', await snapshot(), before);
  text = await mainText(page);
  matchCheck(check, 'filters are back to their defaults after reload', text, new RegExp(`${escapeRe(wholeSet)}\\s*\\n`));
  check('no NaN / undefined / Invalid Date after reload', BROKEN_VALUE.test(text), false);
  await shoot(page, 'problems-4-after-reload');
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== problems: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
