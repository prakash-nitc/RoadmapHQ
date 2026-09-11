// Analytics: every stat and chart renders — on a fresh seed and after real
// activity — with no NaN and no page errors, and reads the same after a reload.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, BROKEN_VALUE, escapeRe, matchCheck, sameText,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

// One Easy, one Medium, one Hard — each in a different pattern.
const SOLVES = [
  { title: 'Pair with Target Sum', pattern: 'Two Pointers' },
  { title: 'Start of LinkedList Cycle', pattern: 'Fast & Slow Pointers' },
  { title: 'No-repeat Substring', pattern: 'Sliding Window' },
];
// Added through Admin with no difficulty, so the donut has to label it.
const UNRATED = 'Harness Unrated Problem';

// Dates as the app formats them (date-fns, en-US), relative to the REAL today:
// these are computed on the server, so they follow the machine clock, and the
// solves below happen "now". Don't run this across midnight.
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = new Date();
today.setHours(0, 0, 0, 0);
const shift = (d, days) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
const MMMd = (d) => `${MON[d.getMonth()]} ${d.getDate()}`;
const MMMdd = (d) => `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
const thisWeekStart = shift(today, -((today.getDay() + 6) % 7)); // Monday
const pastWeekLabels = [7, 6, 5, 4, 3, 2, 1].map((w) => MMMd(shift(thisWeekStart, -7 * w)));

console.log('== analytics');
const total = seedTestDb();

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

// Everything a reader takes away from the page, pulled out of <main>'s text.
function readAnalytics(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const heading = lines.indexOf('Weekly momentum');
  const board = text.split(/\n\s*strongest\s*\n/i)[1] ?? '';
  return {
    thisWeek: text.match(/problems this week\s+(\S+)\s+(\S+)\s+vs last week/i)?.slice(1),
    consistency: text.match(/consistency \(30d\)\s+(\S+)\s+(\d+) of 30 days/i)?.slice(1),
    bestDay: text.match(/best day ever\s+(\S+)\s+([^\n]+)/i)?.slice(1).map((s) => s.trim()),
    currentStreak: text.match(/current streak\s+(\S+)/i)?.[1],
    longestStreak: text.match(/longest streak\s+(\S+)/i)?.[1],
    headline: heading === -1 ? undefined : lines[heading + 1],
    bestWeekAndDelta: text.match(/best week\s+(.+?)\s+(\S+)\s+vs 4-wk avg/i)?.slice(1),
    weekAxis: [...pastWeekLabels.map((l) => lines.includes(l)), lines.includes('This wk')],
    thisWeekBar: text.match(/(\d+)\s+This wk/)?.[1],
    dailyAverage: text.match(/Last 30 days · ([^\n]+)/)?.[1].trim(),
    perDayEmpty: text.includes('Solve a problem to start the chart.'),
    mixEmpty: text.includes('Solve some problems to see your difficulty split.'),
    // The donut's legend: every "<count>\n<LABEL>" pair, in on-screen order.
    mix: Object.fromEntries([...text.matchAll(/(\d+)\s*\n\s*(easy|medium|hard|other)\s*(?=\n|$)/gi)]
      .map((m) => [m[2].toLowerCase(), m[1]])),
    strongest: board.split(/\n\s*needs work\s*\n/i)[0],
  };
}

try {
  await assertSeededLocalDb(page, total);

  console.log('  -- fresh seed: every stat and chart has a sane empty state');
  await page.goto(url('analytics'));
  await waitForMain(page, /Weekly momentum/);
  let text = await mainText(page);
  let a = readAnalytics(text);
  check('problems this week / delta', a.thisWeek, ['0', '0']);
  check('consistency / study days', a.consistency, ['0%', '0']);
  check('best day ever / date', a.bestDay, ['0', '—']);
  check('current streak', a.currentStreak, '0d');
  check('longest streak', a.longestStreak, '0d');
  check('momentum headline speaks to eight empty weeks', a.headline, 'No solves in the last 8 weeks — one problem today restarts your momentum');
  check('best week / momentum delta', a.bestWeekAndDelta, ['0 · —', '0']);
  check('8-week axis: 7 dated weeks + "This wk"', a.weekAxis, Array(8).fill(true));
  check('this-week bar count', a.thisWeekBar, '0');
  check('daily average line', a.dailyAverage, '0/day average over 0 active days');
  check('per-day chart shows its empty state', a.perDayEmpty, true);
  check('difficulty mix shows its empty state', a.mixEmpty, true);
  check('difficulty legend is empty', a.mix, {});
  matchCheck(check, 'pattern leaderboard renders both columns', text, /Pattern leaderboard[\s\S]*strongest[\s\S]*needs work/i);
  matchCheck(check, 'strongest column waits for real progress instead of listing 0% patterns', a.strongest, /Build mastery to climb the board\./);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'analytics-1-fresh');

  console.log('  -- after solving one Easy, one Medium and one Hard today');
  await page.goto(url('problems'));
  await waitForMain(page, /across\s+[1-9]\d*\s+problems/i);
  for (const [i, s] of SOLVES.entries()) {
    await page.getByRole('row', { name: new RegExp(escapeRe(s.title)) }).getByRole('combobox').selectOption({ label: 'Solved' });
    await waitForMain(page, new RegExp(`solved\\s+${i + 1}\\s+remaining`, 'i'));
  }

  await page.goto(url('analytics'));
  await waitForMain(page, /Weekly momentum/);
  await page.waitForLoadState('networkidle');
  text = await mainText(page);
  a = readAnalytics(text);
  check('problems this week / delta', a.thisWeek, ['3', '+3']);
  check('consistency / study days', a.consistency, ['3%', '1']);
  check('best day ever / date', a.bestDay, ['3', MMMdd(today)]);
  check('current streak', a.currentStreak, '1d');
  check('longest streak', a.longestStreak, '1d');
  check('momentum headline', a.headline, 'Back in the game — great comeback week 💪');
  check('best week / momentum delta', a.bestWeekAndDelta, [`3 · ${MMMd(thisWeekStart)}`, '+3']);
  check('8-week axis: 7 dated weeks + "This wk"', a.weekAxis, Array(8).fill(true));
  check('this-week bar count', a.thisWeekBar, '3');
  check('daily average line (singular "day")', a.dailyAverage, '3/day average over 1 active day');
  check('per-day chart replaces its empty state', a.perDayEmpty, false);
  check('difficulty mix replaces its empty state', a.mixEmpty, false);
  check('difficulty legend: easy / medium / hard', a.mix, { easy: '1', medium: '1', hard: '1' });
  check('strongest patterns are the three just worked on', SOLVES.map((s) => a.strongest.includes(s.pattern)), [true, true, true]);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'analytics-2-with-activity');

  console.log('  -- a solved problem with no difficulty gets its own labelled slice');
  await page.goto(url('admin'));
  await waitForMain(page, /Add new patterns, videos, and problems/);
  await settle(page);
  // Only the tab is named "Add Problem" until the problem form opens.
  await page.locator('main').getByRole('button', { name: 'Add Problem', exact: true }).click();
  await waitForMain(page, /new problem/i);
  const form = page.locator('[data-panel="admin-form"]');
  await form.getByPlaceholder('Problem title').fill(UNRATED);
  await form.getByPlaceholder('Problem URL (LeetCode/GFG link)').fill('https://example.com/harness-unrated-problem');
  await form.locator('select').filter({ hasText: 'Two Pointers' }).selectOption({ label: 'Two Pointers' });
  await form.getByRole('button', { name: 'Add Problem', exact: true }).click();
  await waitForMain(page, /Problem added!/);

  await page.goto(url('problems'));
  await waitForMain(page, /across\s+[1-9]\d*\s+problems/i);
  await page.getByPlaceholder('Search problems...').fill(UNRATED);
  await page.getByRole('row', { name: new RegExp(escapeRe(UNRATED)) }).getByRole('combobox').selectOption({ label: 'Solved' });
  await waitForMain(page, /solved\s+4\s+remaining/i);

  await page.goto(url('analytics'));
  await waitForMain(page, /Weekly momentum/);
  await page.waitForLoadState('networkidle');
  text = await mainText(page);
  a = readAnalytics(text);
  check('this week counts the unrated solve', a.thisWeek, ['4', '+4']);
  check('difficulty legend labels it Other', a.mix, { easy: '1', medium: '1', hard: '1', other: '1' });
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'analytics-3-with-unrated');

  console.log('  -- reload');
  await page.reload();
  await waitForMain(page, /Weekly momentum/);
  await page.waitForLoadState('networkidle');
  sameText(check, 'analytics reads identically after a reload', await mainText(page), text);
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== analytics: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
