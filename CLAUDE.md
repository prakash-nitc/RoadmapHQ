# RoadmapHQ — notes for Claude

## Verify every change by driving the app

There are no unit tests in this repo, on purpose. **Every change is verified by driving
the real app in a real browser with the scripts in `drive/` — not by reading code.**
Types and unit tests pass while the page is broken; these don't.

For any change: run the suite(s) covering the areas it touches plus `tour.mjs`, **open
the screenshots and look at them**, and report anything that reads badly (truncated text,
cramped columns, unreadable charts). Passing checks on an ugly page is still a failure.
If no suite covers the area, extend or add one before calling the change done.

```sh
cd drive
node serve.mjs                      # terminal 1: dev server on prisma/test.db
SHOTS=./shots node problems.mjs     # terminal 2: one suite per feature area
SHOTS=./shots node analytics.mjs
SHOTS=./shots node revision.mjs
SHOTS=./shots node dashboard.mjs
SHOTS=./shots node journal.mjs
SHOTS=./shots node goals.mjs
SHOTS=./shots node tour.mjs         # every route: heading, no NaN, no page errors
```

Every suite reseeds `prisma/test.db`, so run them one at a time — never in parallel.

Setup and details: `drive/README.md`. Suites honour `URL` (default
`http://localhost:3000/`) and `SHOTS` (screenshot folder, off when unset). On 2026-09-11
all four original suites passed against the unmodified app (18 / 31 / 25 / 33 checks).
After that day's fixes, all seven passed in one run: problems 23, analytics 36,
revision 39, dashboard 34, journal 10, goals 11, tour 33.

**Playwright stays out of the root `package.json`.** It lives only in
`drive/package.json`, pinned by `drive/package-lock.json` to 1.62.1 (1.63.0's Chromium
download kept timing out; 1.62.1's build was already cached). Don't add a `test` script
at the root. Never commit `drive/shots/`.

## Stack and data facts (verified 2026-09-11)

- Next.js 16.2 App Router with Turbopack — middleware lives in `src/proxy.ts`.
  React 19.2, Tailwind 4 (`@theme` in `src/app/globals.css`, no tailwind config),
  recharts 3, lucide-react, date-fns 4.
- Prisma 6.19 with `@prisma/adapter-libsql`. `src/lib/db.ts` uses **Turso whenever
  `TURSO_DATABASE_URL` is non-empty**, and SQLite at `DATABASE_URL` otherwise.
- **Three databases — never mix them up:**
  - **Turso** holds the user's real data and backs the Vercel app. **`.env` contains its
    credentials** (the deploy and migration scripts use them), so a plain `npm run dev`
    reads and writes PRODUCTION.
  - **`prisma/dev.db`** is an old pre-migration local copy (171 problems, 17 solved, last
    solve 2026-06-05), backed up at `prisma/dev-backup-2026-09-11.db`. Leave it alone.
  - **`prisma/test.db`** is the harness's throwaway database — the only one suites wipe.
- Drive the app only through `node drive/serve.mjs` (Turso variables blanked,
  `DATABASE_URL=file:./test.db`). Suites seed through `seedTestDb()` in
  `drive/support.mjs` and run a tripwire before their first write. In PowerShell,
  `$env:TURSO_DATABASE_URL = ''` deletes the variable and `.env` refills it — that does
  not work.
- `npm run dev` serves http://localhost:3000. `APP_PASSWORD` is empty in `.env`, so
  `src/proxy.ts` skips the `/unlock` gate locally.
- `npm run db:reset` = `prisma db push --force-reset --skip-generate && prisma db seed`.
  It is the seeding mechanism — don't write your own DB setup. It resets whatever
  `DATABASE_URL` points at (the schema datasource and `prisma/seed.ts` both read it).
  `--skip-generate` is deliberate: on Windows the running dev server locks Prisma's
  query-engine DLL, so regenerating during a reset failed with `EPERM` and left a 21 MB
  `.tmp` copy in `node_modules/.prisma/client` on every run. After changing
  `prisma/schema.prisma`, stop the dev server and run `npm run db:generate`.
- **Under Claude Code, Prisma refuses `--force-reset`** unless the user consents. Ask the
  user, then pass their exact reply as `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` when
  running the suites. Ask again in each new session; never store or reuse consent.
- The seed creates 15 patterns, 114 videos and 171 problems (all Not started; one seed
  entry is dropped as a url+pattern duplicate) plus default settings — no activity and
  no dates. It does **not** include the revision data applied to production by one-off
  scripts (CORE anchors, anchor insights, Propeers mapping), so the Revision Corner shows
  its "not tagged yet" states locally.
- Baseline when the harness was added: `npm run build` passed; `npm run lint` failed with
  17 errors, all pre-existing in app code (react-hooks purity, set-state-in-effect and
  immutability rules, plus one prefer-const in `scripts/`). They were fixed the same day
  and `npm run lint` reports 0 problems — keep it at zero. Accepted patterns: read
  localStorage and clocks through `useSyncExternalStore` (`src/lib/use-local-storage.ts`),
  load data inside the effect with a cancel flag, and decide time-based flags on the
  server (e.g. `getTestStatus` in `src/lib/revision-actions.ts`).

## Rules for writing assertions

1. Assert on **user-visible text**, via `page.locator('main').innerText()`. Never on CSS
   classes or Tailwind utility selectors — those break on every restyle.
2. For structural things text can't identify, add a stable `data-*` hook to the
   component (e.g. `data-panel="queue"`). That is the only app-code change a
   verification task permits; keep it minimal. Existing: `data-pattern-row="<name>"`
   on the Revision Corner pattern rows, `data-panel="admin-form"` on the Admin form card.
3. **Always assert the change survives a reload.** Capture the text, `page.reload()`,
   compare.
4. Assert `/NaN|undefined|Invalid Date/` does NOT appear.
5. Assert the `errors` array from `open()` is `[]` at the end of every suite.
6. Recharts draws SVG — assert on the surrounding labels, legend and numbers, and rely
   on the screenshot for the chart itself.
7. Fixed viewport 1440×900. Avoid `.first()` on a selector that matches several things;
   be specific or add a hook.
8. Prefer `getByRole` for interaction and raw text matching for assertions.

App-specific traps:

- `innerText` applies CSS `text-transform`, so labels styled `uppercase` come back as
  `SOLVED`, `HOW MANY REPS?`. Match them case-insensitively.
- Pages paint a zero state before their data arrives (Problems first shows
  "across 0 problems / Solved 0"). Wait for the loaded state (`waitForMain`) before
  reading numbers — a naive read passes against the wrong database.
- Server-rendered text is visible before React hydrates, and a click that lands before
  hydration is silently dropped. After navigating to a server-rendered page, call
  `settle(page)` (network idle) before clicking. `shoot()` settles on its own —
  screenshotting mid-hydration produced a spurious hydration-mismatch console error.
- Charts animate in: the Analytics donut is still empty at network idle and fully
  drawn about a second later. `shoot()` waits for finite CSS animations and for chart
  SVG to stop changing, so a blank chart in a screenshot is a real finding.
- Don't use Playwright's `fullPage` capture here. It paints beyond the viewport, and
  Chromium mis-draws tall frosted-glass (`backdrop-filter`) cards that way: the Problems
  table came out shifted under the sidebar and faded while the live page measured fine.
  `shoot()` stretches the viewport to the page height, captures, and restores 1440×900
  (assertions stay at the fixed size). If a screenshot looks broken, measure the live
  layout before believing it.
- Once, every nested route (`/revision/*`, `/patterns/<id>`, `/api/*`) returned 404 on a
  long-running dev server while single-segment routes worked. It didn't reproduce on a
  fresh server; if it happens, restart `node serve.mjs`.
- Global CSS in `src/app/globals.css` that sets margin or padding must sit inside
  `@layer base`. Tailwind v4 emits utilities in `@layer utilities`, and an unlayered rule
  beats every layered one — an unlayered `* { margin: 0; padding: 0 }` once silently
  disabled every `p-*`, `m-*` and `space-y-*` class in the app (removed 2026-09-11).
- A click that times out with "`<nextjs-portal>` … intercepts pointer events" is the
  dev-only Next badge sitting on the target. `next.config.ts` puts it bottom-right; at
  the default bottom-left it covered the collapsed sidebar's Expand button.
- A check that something is *absent* passes vacuously if it reads before hydration:
  client-only UI (the streak warning, Sunday banner, celebration) renders after it.
  Wait for a post-hydration signal first — `dashboard.mjs` waits for the sidebar streak
  chip, which fetches its own data once hydrated.
- `innerText` may put no break between flex siblings: the sidebar chip's number and
  "DAY" failed to match `\d+\s+day` and matched `\d+\s*day`.

## The server-clock caveat

Playwright's `page.clock.install()` patches only the **browser's** `Date`. This app
computes dates on the server — server components and the actions in `src/lib/actions.ts`
and `src/lib/revision-actions.ts` use real server time — so a fake browser clock gives
silent mismatches. Seed relative to the real today and assert relative facts ("a
problem solved now counts in this week"). Don't run date-sensitive suites across
midnight.

Client components that read only the **browser** clock — the streak warning, the Sunday
review banner, the celebration's day key — can be driven with
`page.clock.setFixedTime`; `dashboard.mjs` does it in a second browser. A page that loads
or reloads while pinned to a different day than the server's today fails hydration (the
server-rendered calendar disagrees) and throws a page error, so load pages pinned to the
server's today and change the pinned day only between client-side navigations. What the
server computes — streaks, "due", mission completion — can't be moved this way, which is
why the streak warning's positive path (a streak built through yesterday, nothing yet
today) has no suite.
