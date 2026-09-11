// Tour: every route renders — one <h1> reading what it should, no NaN /
// undefined / Invalid Date, no uncaught errors — with a little real activity in
// the database, and a full-page screenshot of each page to review. This is the
// broad net; the feature suites go deep.

import { open, checker } from './lib.mjs';
import {
  url, mainText, waitForMain, settle, shoot, BROKEN_VALUE, escapeRe,
  seedTestDb, assertSeededLocalDb,
} from './support.mjs';

// Route → the page's <h1>, as a reader sees it.
const ROUTES = [
  ['/', /^Day \d+/],
  ['/problems', /^Problems$/],
  ['/patterns', /^Patterns$/],
  ['/patterns/[id]', /^Two Pointers$/],
  ['/revision', /^Revision Corner$/],
  ['/revision/drill', /^Pattern Recognition Drill$/],
  ['/revision/test', /^Interleaved Test$/],
  ['/revision/stats', /^Pattern Health$/],
  ['/revision/mistakes', /^What tripped you up$/],
  ['/revision/playbook', /^Revision Playbook$/],
  ['/review', /^Week of .+–.+/],
  ['/analytics', /^Analytics$/],
  ['/goals', /^Goals & projections$/],
  ['/journal', /^Daily journal$/],
  ['/videos', /^Playlist$/],
  ['/admin', /^Admin$/],
];
// Real activity so dashboards and charts aren't all empty states.
const SOLVES = ['Pair with Target Sum', 'Start of LinkedList Cycle', 'No-repeat Substring'];

const slug = (route) => (route === '/' ? 'dashboard' : route.slice(1).replaceAll('/', '-').replace('[id]', 'detail'));

console.log('== tour');
const total = seedTestDb();

const { check, done } = checker();
const { browser, page, errors } = await open();
page.setDefaultNavigationTimeout(60_000);
let aborted = false;

const headings = async () => (await page.locator('main').getByRole('heading', { level: 1 }).allInnerTexts()).map((t) => t.trim());

try {
  await assertSeededLocalDb(page, total);
  for (const [i, title] of SOLVES.entries()) {
    await page.getByRole('row', { name: new RegExp(escapeRe(title)) }).getByRole('combobox').selectOption({ label: 'Solved' });
    await waitForMain(page, new RegExp(`solved\\s+${i + 1}\\s+remaining`, 'i'));
  }
  console.log(`    ok    solved ${SOLVES.length} problems so pages have data`);

  for (const [n, [route, heading]] of ROUTES.entries()) {
    console.log(`  -- ${route}`);
    let path = route;
    if (route === '/patterns/[id]') {
      await page.goto(url('patterns'));
      await waitForMain(page, /Two Pointers/);
      await settle(page);
      path = await page.evaluate(() => [...document.querySelectorAll('main a[href^="/patterns/"]')]
        .find((a) => a.innerText.includes('Two Pointers'))?.getAttribute('href'));
      if (!path) throw new Error('no link to the Two Pointers pattern on /patterns');
    }

    await page.goto(url(path));
    await page.locator('main').getByRole('heading', { level: 1 }).waitFor();
    await settle(page); // client pages load their data after hydration
    const h1s = await headings();
    check(`${route}: exactly one <h1>, reading ${heading}`, [h1s.length, heading.test(h1s[0] ?? '')], [1, true]);
    if (!heading.test(h1s[0] ?? '')) console.log(`           <h1> text: ${JSON.stringify(h1s)}`);
    check(`${route}: no NaN / undefined / Invalid Date`, BROKEN_VALUE.test(await mainText(page)), false);
    await shoot(page, `tour-${String(n + 1).padStart(2, '0')}-${slug(route)}`);
  }
} catch (e) {
  aborted = true;
  console.log(`!! SUITE ABORTED: ${e.message}`);
} finally {
  check('no uncaught page errors on any route', errors, []);
  await browser.close();
}

const failures = done();
console.log(`== tour: ${aborted ? 'ABORTED' : failures === 0 ? 'PASS' : `${failures} FAILED`}`);
process.exit(failures === 0 && !aborted ? 0 : 1);
