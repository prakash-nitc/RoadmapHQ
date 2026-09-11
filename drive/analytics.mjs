// Analytics: every stat and chart renders — on a fresh seed and after real
// activity — with no NaN and no page errors, and reads the same after a reload.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, shoot, BROKEN_VALUE, escapeRe, matchCheck, sameText,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

// One Easy, one Medium, one Hard — each in a different pattern.
const SOLVES = [
  { title: 'Pair with Target Sum', pattern: 'Two Pointers' },
  { title: 'Start of LinkedList Cycle', pattern: 'Fast & Slow Pointers' },
  { title: 'No-repeat Substring', pattern: 'Sliding Window' },
];

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
    mix: text.match(/(\d+)\s+easy\s+(\d+)\s+medium\s+(\d+)\s+hard/i)?.slice(1) ?? null,
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
  check('momentum headline', a.headline, 'Holding steady — consistency compounds');
  check('best week / momentum delta', a.bestWeekAndDelta, ['0 · —', '0']);
  check('8-week axis: 7 dated weeks + "This wk"', a.weekAxis, Array(8).fill(true));
  check('this-week bar count', a.thisWeekBar, '0');
  check('daily average line', a.dailyAverage, '0/day average over 0 active days');
  check('per-day chart shows its empty state', a.perDayEmpty, true);
  check('difficulty mix shows its empty state', a.mixEmpty, true);
  matchCheck(check, 'pattern leaderboard renders both columns', text, /Pattern leaderboard[\s\S]*strongest[\s\S]*needs work/i);
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
  check('daily average line', a.dailyAverage, '3/day average over 1 active days');
  check('per-day chart replaces its empty state', a.perDayEmpty, false);
  check('difficulty mix replaces its empty state', a.mixEmpty, false);
  check('difficulty mix: easy / medium / hard', a.mix, ['1', '1', '1']);
  check('strongest patterns are the three just worked on', SOLVES.map((s) => a.strongest.includes(s.pattern)), [true, true, true]);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(text), false);
  await shoot(page, 'analytics-2-with-activity');

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
