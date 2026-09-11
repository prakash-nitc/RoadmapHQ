// Dashboard: the sidebar remembers being collapsed; the late-evening streak
// warning, the Sunday review banner and the mission-complete celebration appear
// when they should; dismissing the banner or the celebration sticks.
//
// The warning, the banner and the celebration read the browser's clock, so a
// second browser with Playwright's clock pinned drives them. The server keeps real
// time (CLAUDE.md, "The server-clock caveat"), and the server-rendered calendar
// fails to hydrate in a browser pinned to another day. So a page only ever loads
// or reloads pinned to the server's today; the Sunday checks move the pinned day
// between client-side navigations, which don't hydrate.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, shootNow, BROKEN_VALUE, escapeRe,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

const SOLVES = ['Triplet Sum to Zero', 'Squaring a Sorted Array', 'Start of LinkedList Cycle'];
const WATCH = ['The Best Way To Learn DSA', 'Master Time Complexity in Just 30 Minutes']; // search terms, one video each
const DASHBOARD = /Good (morning|afternoon|evening|night)|Burning the midnight oil/;
const WARNING = /(Heads up|Running short|Streak at risk) — (.+?) to keep your (\d+)-day streak alive/;
const BANNER = /Your week in review is ready/;
const CELEBRATION = /Daily mission complete/;

const todayAt = (h, m) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};
// 10:00 on the first Sunday after today, or `weeks` Sundays after that.
const sundayAfter = (weeks) => {
  const d = todayAt(10, 0);
  d.setDate(d.getDate() + (7 - d.getDay()) + 7 * weeks);
  return d;
};

console.log('== dashboard');
const total = seedTestDb();

const { check, done } = checker();
const real = await open();   // real clock
const pinned = await open(); // Playwright clock
// Some hydration mismatches are only logged as console errors, so collect those too.
const consoleErrors = [];
for (const [name, b] of [['real', real], ['pinned', pinned]]) {
  b.page.setDefaultNavigationTimeout(60_000);
  b.page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`${name}: ${m.text().slice(0, 160)}`);
  });
}
let aborted = false;

const pinTo = (date) => pinned.page.clock.setFixedTime(date);
// The warning, the banner and the celebration render only after hydration, so a
// check that one is absent passes vacuously on a page read too early. The sidebar
// streak chip loads its own data after hydration: once it shows, the page has hydrated.
async function hydrated(page) {
  await settle(page);
  if (!(await chip(page))) throw new Error('the sidebar streak chip never rendered: the page did not finish hydrating');
}
async function openDashboard(page) {
  await page.goto(url(''));
  await waitForMain(page, DASHBOARD);
  await hydrated(page);
}
async function reloadDashboard(page) {
  await page.reload();
  await waitForMain(page, DASHBOARD);
  await hydrated(page);
}
// Leave and come back by client-side navigation: nothing hydrates, so the page
// can render a pinned day other than the server's today.
async function revisitDashboard(page) {
  await page.getByRole('link', { name: 'Journal', exact: true }).click();
  await waitForMain(page, /Daily journal/);
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await waitForMain(page, DASHBOARD);
  await hydrated(page);
}
const shows = (page, re, timeout = 10_000) => waitForMain(page, re, timeout).then(() => true, () => false);
const gone = (page, re, timeout = 10_000) => page.waitForFunction(
  ([src, flags]) => !new RegExp(src, flags).test(document.querySelector('main')?.innerText ?? ''),
  [re.source, re.flags],
  { timeout },
).then(() => true, () => false);
const warningOn = async (page) => {
  const m = (await mainText(page)).match(WARNING);
  return m ? { label: m[1], left: m[2], streak: m[3] } : null;
};
const sidebar = (page) => page.getByRole('complementary');
const sidebarLines = async (page) => (await sidebar(page).innerText()).split('\n').map((l) => l.trim()).filter(Boolean);
// The streak chip in the sidebar footer: the number and DAY(S) share a row (flex
// items, which may come back with no break between them), then the stage name.
// It loads its own data after hydration, so poll until it has rendered.
async function chip(page) {
  const read = async () => (await sidebar(page).innerText()).match(/(\d+)\s*days?\s*\n\s*([^\n]+)/i)?.slice(1).map((s) => s.trim());
  for (let tries = 0; tries < 40 && !(await read()); tries++) await page.waitForTimeout(250);
  return read();
}
// Cards under the hero read "CURRENT STREAK / 0 days / <caption>" and
// "PROJECTED FINISH / <date> / <caption>".
const streakCaption = (text) => text.match(/Current streak\s+\d+ days?\s+([^\n]+)/i)?.[1].trim();
const projectionCaption = (text) => text.match(/Projected finish\s+[^\n]+\s+([^\n]+)/i)?.[1].trim();
// Today's mission rows end in "<done> / <target> videos|problems".
const missionCounts = (text) => ['videos', 'problems'].map((unit) => text.match(new RegExp(`\\d+ / \\d+ ${unit}`))?.[0]);

async function solve(page, title) {
  await page.goto(url('problems'));
  await waitForMain(page, /across\s+[1-9]\d*\s+problems/i);
  await page.waitForFunction(() => document.querySelector('table')?.tBodies[0]?.rows.length > 0);
  const row = page.getByRole('row', { name: new RegExp(escapeRe(title)) });
  const rows = await row.count();
  if (rows !== 1) throw new Error(`expected one Problems row for "${title}", found ${rows}`);
  const solved = Number((await mainText(page)).match(/solved\s+(\d+)\s+remaining/i)?.[1]);
  await row.getByRole('combobox').selectOption({ label: 'Solved' });
  await waitForMain(page, new RegExp(`solved\\s+${solved + 1}\\s+remaining`, 'i'));
}

async function watch(page, search) {
  await page.goto(url('videos'));
  const box = page.getByPlaceholder('Search videos...');
  await box.waitFor();
  await settle(page);
  await box.fill(search);
  const unwatched = page.getByRole('button', { name: 'Mark watched', exact: true });
  const one = await page.waitForFunction(
    () => document.querySelectorAll('main button[aria-label="Mark watched"]').length === 1, null, { timeout: 10_000 },
  ).then(() => true, () => false);
  if (!one) throw new Error(`searching videos for "${search}" left ${await unwatched.count()} unwatched matches, expected 1`);
  await unwatched.click();
  await page.getByRole('button', { name: 'Mark unwatched', exact: true }).waitFor({ timeout: 10_000 });
}

try {
  await assertSeededLocalDb(real.page, total);
  const page = real.page;

  console.log('  -- sidebar: collapsing sticks across a reload');
  const LABELS = ['Dashboard', 'Revision Corner', 'Journal', 'Goals', 'Collapse'];
  const expand = page.getByRole('button', { name: 'Expand sidebar', exact: true });
  const collapse = page.getByRole('button', { name: 'Collapse', exact: true });
  const appears = (locator) => locator.waitFor({ timeout: 10_000 }).then(() => true, () => false);

  await openDashboard(page);
  check('exactly one sidebar is visible at 1440px', await sidebar(page).count(), 1);
  const fresh = await mainText(page);
  check('fresh: the streak card invites a first solve, not "Personal best!"', streakCaption(fresh), 'Solve a problem to start one');
  check('fresh: projected finish says it assumes the daily target', projectionCaption(fresh), 'At your daily target pace');
  check("fresh: today's mission counts done / target", missionCounts(fresh), ['0 / 2 videos', '0 / 3 problems']);
  let lines = await sidebarLines(page);
  check('expanded: nav labels and the Collapse button are shown', LABELS.filter((l) => !lines.includes(l)), []);
  await collapse.click();
  check('Collapse turns the button into "Expand sidebar"', await appears(expand), true);
  check('collapsed: no text left in the sidebar', await sidebarLines(page), []);
  await shoot(page, 'dashboard-1-sidebar-collapsed');
  await page.reload();
  await waitForMain(page, DASHBOARD);
  check('still collapsed after a reload', await appears(expand), true);
  check('still no text in the sidebar after a reload', await sidebarLines(page), []);
  await settle(page);
  await expand.click();
  check('Expand brings the labels back', await appears(collapse), true);
  await reloadDashboard(page);
  lines = await sidebarLines(page);
  check('expanded also sticks across a reload', LABELS.filter((l) => !lines.includes(l)), []);
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(await mainText(page)), false);

  console.log('  -- streak warning: only for a streak still at risk, late in the day');
  await pinTo(todayAt(22, 30));
  await openDashboard(pinned.page);
  check('22:30 with no streak: no warning', await warningOn(pinned.page), null);

  await solve(page, SOLVES[0]);
  await openDashboard(page);
  check("after a solve today the sidebar chip counts it (full page load)", await chip(page), ['1', 'Spark']);
  await reloadDashboard(pinned.page);
  check('the pinned browser agrees: 1 day, not at risk', await chip(pinned.page), ['1', 'Spark']);
  check('22:30 after a solve today: the streak is already banked, so no warning', await warningOn(pinned.page), null);
  check('no celebration while the mission is still open', CELEBRATION.test(await mainText(pinned.page)), false);
  await shoot(pinned.page, 'dashboard-2-late-evening-after-a-solve');

  console.log('  -- Sunday review banner: shows on Sunday, "Later" sticks for that week');
  const saturday = sundayAfter(0);
  saturday.setDate(saturday.getDate() - 1);
  await pinTo(saturday);
  await revisitDashboard(pinned.page);
  check('no banner on Saturday', BANNER.test(await mainText(pinned.page)), false);
  await pinTo(sundayAfter(0));
  await revisitDashboard(pinned.page);
  check('the banner shows on Sunday', await shows(pinned.page, BANNER), true);
  await shoot(pinned.page, 'dashboard-3-sunday-banner');
  await pinned.page.getByRole('button', { name: 'Later', exact: true }).click();
  check('"Later" hides it', await gone(pinned.page, BANNER), true);
  // Reload on the server's today so the page hydrates cleanly, then go back to Sunday.
  await pinTo(todayAt(22, 30));
  await reloadDashboard(pinned.page);
  await pinTo(sundayAfter(0));
  await revisitDashboard(pinned.page);
  check('still hidden that Sunday after a reload', BANNER.test(await mainText(pinned.page)), false);
  await pinTo(sundayAfter(1));
  await revisitDashboard(pinned.page);
  check('back again the following Sunday', await shows(pinned.page, BANNER), true);
  await pinTo(todayAt(22, 30));
  await reloadDashboard(pinned.page);

  console.log('  -- celebration: once the mission is complete, until dismissed');
  await solve(page, SOLVES[1]);
  await solve(page, SOLVES[2]);
  await watch(page, WATCH[0]);
  await watch(page, WATCH[1]);
  await page.goto(url(''));
  check('3 problems + 2 videos complete the mission and the celebration appears', await shows(page, CELEBRATION), true);
  await page.waitForTimeout(2_000); // let the confetti fall into frame
  await shootNow(page, 'dashboard-4-celebration');
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click({ timeout: 3_000 });
  check('Dismiss closes it', await gone(page, CELEBRATION), true);
  await reloadDashboard(page);
  check('it stays dismissed after a reload', CELEBRATION.test(await mainText(page)), false);
  const complete = await mainText(page);
  check("today's mission reads 2 / 2 videos and 3 / 3 problems", missionCounts(complete), ['2 / 2 videos', '3 / 3 problems']);
  check('a first-day streak is a personal best', streakCaption(complete), 'Personal best!');
  check('no NaN / undefined / Invalid Date', BROKEN_VALUE.test(await mainText(page)), false);
  await shoot(page, 'dashboard-5-mission-complete');

  // The pinned browser has never dismissed it, so it celebrates too.
  await pinTo(todayAt(22, 30));
  await pinned.page.reload();
  const appeared = await shows(pinned.page, CELEBRATION);
  const shownAt = Date.now();
  check('a browser that has not dismissed it still celebrates', appeared, true);
  const selfDismissed = await gone(pinned.page, CELEBRATION, 15_000);
  const after = Math.round((Date.now() - shownAt) / 100) / 10;
  check('left alone, it dismisses itself after its 8s timer', selfDismissed && after >= 4 ? 'dismissed by its timer' : { selfDismissed, after }, 'dismissed by its timer');
  await reloadDashboard(pinned.page);
  check('and stays dismissed after a reload', CELEBRATION.test(await mainText(pinned.page)), false);
  check('22:30 with the mission complete: no warning', await warningOn(pinned.page), null);
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors', [...real.errors, ...pinned.errors], []);
  check('no console errors', consoleErrors, []);
  await real.browser.close();
  await pinned.browser.close();
}

const failures = done();
console.log(`== dashboard: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
