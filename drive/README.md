# drive/ — browser verification for RoadmapHQ

Scripts that seed a known database, drive the real app in a real Chromium, assert on
what a person would read on screen, and save screenshots to look at. There is no
unit-test suite on purpose: types and unit tests pass while the page is broken.

Playwright lives only in this folder (its own `package.json`, pinned by
`package-lock.json`). It never enters the app's dependency tree, and the root
`package.json` has no `test` script.

| File | What it is |
|---|---|
| `lib.mjs` | `open()` a 1440×900 page that collects page errors; `checker()` for PASS/FAIL lines |
| `support.mjs` | test-database seeding, `URL`/`SHOTS` env, waits, screenshots, the wrong-database tripwire |
| `serve.mjs` | starts `next dev` against the test database |
| `problems.mjs` | list renders, filters work, marking a problem solved persists |
| `analytics.mjs` | every stat and chart renders — empty and with activity — with no NaN |
| `revision.mjs` | the recognition drill advances and records; a practiced pattern stays moved |
| `tour.mjs` | all 16 routes render their heading with no NaN or page errors; screenshots each |

## Which database?

The suites use their own throwaway file, **`prisma/test.db`**. Nothing here touches the
real data (Turso) or the old local copy (`prisma/dev.db`):

- `serve.mjs` starts the dev server with `DATABASE_URL=file:./test.db` and the Turso
  variables blanked.
- Every suite starts by running `npm run db:reset` aimed at `test.db`, and stops unless
  Prisma reports `test.db` as the target.
- Before its first click that writes, every suite checks the app shows the freshly seeded
  data, and stops if it doesn't.

**Don't drive the app from a plain `npm run dev`.** `.env` holds the production Turso
credentials and `src/lib/db.ts` uses Turso whenever `TURSO_DATABASE_URL` is set, so
`npm run dev` reads and writes production. (In PowerShell, `$env:TURSO_DATABASE_URL = ''`
deletes the variable and `.env` refills it — use `serve.mjs`.)

## One-time setup

```sh
cd drive
npm i
npx playwright install chromium
```

## Run

```sh
cd drive
node serve.mjs                       # terminal 1 — leave it running

SHOTS=./shots node problems.mjs      # terminal 2
SHOTS=./shots node analytics.mjs
SHOTS=./shots node revision.mjs
SHOTS=./shots node tour.mjs
```

PowerShell: `$env:SHOTS = './shots'; node tour.mjs`

- `URL` — base URL of the app, default `http://localhost:3000/`
- `SHOTS` — folder for full-page screenshots; none are taken when unset

Exit code `0` means every check passed and no page threw an uncaught error. Read any
`!! CONSOLE:` lines even when checks pass. Then open the screenshots and look at them —
passing checks on an ugly page is still a failure.

`db:reset` skips Prisma client generation on purpose (a running dev server locks the
engine file on Windows). After changing `prisma/schema.prisma`, stop the dev server and
run `npm run db:generate`.

### Under Claude Code

Prisma refuses `prisma db push --force-reset` when an AI agent runs it. The agent must ask
you first and pass your exact consenting reply as
`PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`. That consent is per session and is never
stored in the repo.

## Writing a suite

The assertion rules live in the root `CLAUDE.md`. Traps specific to this app:

- `innerText` applies CSS `text-transform`, so labels styled `uppercase` come back as
  `SOLVED` / `HOW MANY REPS?` — match them case-insensitively.
- Several pages paint a zero state before their data arrives (Problems shows
  "across 0 problems" first). Wait for the loaded state with `waitForMain` before
  reading numbers.
- Server-rendered text is on screen before React hydrates, and a click that lands before
  hydration is silently dropped. After navigating to a server-rendered page, call
  `settle(page)` before clicking.
- Charts animate in — the Analytics donut starts ~400 ms late and is still empty at
  network-idle. `shoot()` waits for finite CSS animations to end and for chart SVG to stop
  changing before it captures, so a blank chart in a shot is worth investigating.
- Full-page screenshots draw `position: fixed` elements (the sidebar, the aurora
  background) only within the first 900 px. A sidebar that "ends" partway down a shot is
  not a layout bug.
