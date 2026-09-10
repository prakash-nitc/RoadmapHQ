# DSA Revision Hub — Architecture & Build Specification

> **For the coding agent:** This is a complete build spec. Read §0 and §1 fully before writing any
> code. §1 contains hard constraints about an existing application that must not be broken.
> Build in the phase order given in §12. Do not build later phases early.

---

## 0. Fill this in before pasting

The spec assumes a default stack. If yours differs, edit this block — everything downstream
adapts from it.

```
EXISTING_APP_FRAMEWORK  = Next.js 14+ (App Router)      # or: Vite+React SPA / Remix / SvelteKit
EXISTING_APP_DB         = PostgreSQL                     # or: SQLite / MySQL / Supabase
EXISTING_APP_ORM        = Prisma                         # or: Drizzle / raw SQL / TypeORM
EXISTING_APP_AUTH       = <fill in>                      # NextAuth / Clerk / Supabase Auth / custom
EXISTING_APP_STYLING    = Tailwind + shadcn/ui           # or: CSS modules / styled-components
DEPLOY_TARGET           = Vercel                          # or: Railway / Render / self-hosted
REPO_LAYOUT             = single repo, add a route group  # or: monorepo with shared db package
```

**Agent instruction:** before generating anything, open the existing repo and confirm each line
above. If a line is wrong, correct it and note what changed. Do not guess silently.

### Stack adaptation notes

| If the stack is… | What changes |
|---|---|
| Prisma + Postgres (default) | Use `multiSchema` preview feature, put all new models in schema `revision`. |
| Prisma + SQLite | No schema separation available. Prefix every new model with `Rev` and every table with `revision_`. Same isolation guarantee, enforced by naming. |
| Drizzle | Same table design; put new tables in `db/revision/schema.ts`, import the existing schema read-only. |
| Supabase | Create a `revision` Postgres schema, expose it in the API settings, and write RLS policies keyed on `auth.uid()`. |
| Separate deployable app | Extract the Prisma client into `packages/db`, consumed by both apps. Share auth via a cookie scoped to the parent domain. |

---

## 1. Hard constraints — the non-disturbance contract

The user has a working DSA tracker. It is the source of truth for problems, patterns, and solve
status. This project is an **additive extension**, not a refactor.

### 1.1 Rules the agent must not break

1. **Never write to existing tables.** No inserts, no updates, no deletes. The one exception is
   the optional, feature-flagged write-back in §5.4, which is `OFF` by default.
2. **Never modify existing migrations.** Every change is a new, additive migration.
3. **Never rename, drop, or alter an existing column.**
4. **All new tables live in the `revision` schema** (or carry the `revision_` prefix on SQLite).
5. **Exactly one file reads the existing tables:** `lib/revision/dsa-adapter.ts` (§4). No other
   file in the revision feature may import the existing models.
6. **Exactly two edits to existing application code are permitted:**
   - Remove the old "Revisions" nav item from the sidebar.
   - Add a "Revision Hub" nav item pointing at `/revision`.
   Nothing else in the existing app changes.
7. **No changes to existing auth.** Reuse the current session. If the revision routes need a user
   id, get it from the existing session helper.
8. **No new global CSS.** Scope all styles to the revision route group.

### 1.2 What to do if the existing schema doesn't match the adapter interface

Do **not** change the existing schema. Change the adapter implementation (§4.2) to map whatever
shape exists onto the interface. If a field genuinely does not exist (e.g. there is no
`lastSolvedAt`), return `null` and let the scheduling code fall back per §5.3.

---

## 2. Product intent — what this app is and is not

### It is
A **spaced-retrieval engine** for problems the user has already solved. Its job is to convert a
long list of "solved once" problems into a shorter list of problems that survive a cold re-solve.

### It is not
A second problem tracker. It does not manage the sheet, does not mark problems solved for the
first time, and does not duplicate the existing Problems page.

### The single design principle

> The existing app answers **"how many have I solved?"**
> This app answers **"how many can I still do cold, today?"**

Those are different numbers. In the reference user's data they are 111 and roughly 9.

### Metric redesign — important

The supplied mockup leads with `Easy/Med/Hard Solved` and `72% Solved`. Those are the vanity
metrics this app exists to replace. Build the dashboard with these instead:

| Mockup tile | Replace with | Definition |
|---|---|---|
| Easy / Med / Hard Solved | **Retained (L3+)** | count of cards at level ≥ 3 and not decayed, over total cards |
| Revising Overall 72% | **Retention Rate** | passes ÷ attempts on `COLD` and `TIMED` reviews in the last 30 days |
| Weak Areas | **Pattern Decay** | pattern health score, §6.4 |
| Progress: Problems Solved | **Progress: L3+ over time** | solved count may remain as a faint secondary series |

Keep `Due Today` and `Due This Week` exactly as designed — those are correct.

---

## 3. System architecture

### 3.1 Recommended topology (default)

Single Next.js application, single database, two feature areas.

```
apps/web  (existing Next.js app)
├── app/
│   ├── (tracker)/                 ← EXISTING. Do not touch.
│   │   ├── dashboard/
│   │   ├── problems/
│   │   ├── patterns/
│   │   └── ...
│   └── (revision)/                ← NEW. Everything lives here.
│       └── revision/
│           ├── page.tsx                    # Dashboard
│           ├── today/page.tsx              # Daily Loop
│           ├── queue/page.tsx              # Review Queue
│           ├── review/[cardId]/page.tsx    # Review Runner
│           ├── repair/[patternKey]/page.tsx
│           ├── templates/page.tsx
│           ├── drill/page.tsx              # 60-second identification
│           ├── test/page.tsx               # Interleaved weekly test
│           ├── mistakes/page.tsx
│           ├── anchors/page.tsx
│           ├── playbook/page.tsx
│           ├── stats/page.tsx
│           └── oa-mode/page.tsx
├── lib/revision/
│   ├── dsa-adapter.ts             ← ONLY file that reads existing tables
│   ├── scheduler.ts               ← the SRS algorithm (§5)
│   ├── health.ts                  ← pattern health scoring (§6.4)
│   ├── queries.ts                 ← all revision reads
│   ├── actions.ts                 ← all revision writes (server actions)
│   └── seed/
│       ├── templates.ts
│       └── anchors.ts
├── components/revision/           ← scoped UI components
└── prisma/schema.prisma           ← ADD models, never edit existing ones
```

**Why single-app:** shared session, shared Prisma client, no CORS, no token exchange, and
"redirect from the DSA app" becomes `<Link href="/revision">`. The database-sharing requirement is
satisfied trivially.

### 3.2 Alternative topology (only if a separate deployable is required)

```
repo/
├── packages/db/          # Prisma schema + generated client, published internally
├── apps/tracker/         # existing app, imports @repo/db
└── apps/revision/        # new app, imports @repo/db
```

Auth: issue the session cookie on `.yourdomain.com` so both `tracker.yourdomain.com` and
`revision.yourdomain.com` read it. Deep links become absolute URLs from an env var
(`NEXT_PUBLIC_TRACKER_URL`, `NEXT_PUBLIC_REVISION_URL`).

Only choose this if there is a deployment reason. It costs real complexity for no product benefit.

### 3.3 Data flow

```
                    ┌────────────────────────┐
  existing tables → │  dsa-adapter.ts        │ ── read-only ──┐
  (problems,        │  (the ONLY reader)     │                │
   patterns,        └────────────────────────┘                ▼
   user_progress)                                    ┌──────────────────┐
                                                     │  syncCards()     │
                                                     │  (§5.2)          │
                                                     └────────┬─────────┘
                                                              │ upsert
                                                              ▼
                              ┌──────────────────────────────────────────┐
                              │  revision.*  (all new tables)            │
                              │  ReviewCard, ReviewLog, Mistake,         │
                              │  Template, Session, SessionItem,         │
                              │  RepairTask, PatternHealth, Settings     │
                              └───────────┬──────────────────────────────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     ▼                    ▼                    ▼
              scheduler.ts           health.ts            queries.ts
              (interval math)     (decay scoring)         (all reads)
```

Sync is **one-way and non-destructive**. It never writes back to the tracker (except §5.4) and
never overwrites scheduling state on an existing card.

---

## 4. The adapter — isolating the unknown schema

### 4.1 Interface (write this file first, exactly as specified)

```ts
// lib/revision/dsa-adapter.ts
//
// THE ONLY MODULE PERMITTED TO READ THE EXISTING DSA TRACKER TABLES.
// READ-ONLY. No writes, ever. If the tracker schema changes, only this file changes.

export type DsaDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'UNKNOWN';
export type DsaStatus     = 'NOT_STARTED' | 'SOLVED' | 'REVISED';

export interface DsaProblem {
  id: string;                    // stable id from the tracker
  title: string;
  slug: string | null;
  patternKey: string;            // stable key, e.g. "two-pointers"
  patternName: string;           // display name, e.g. "Two Pointers"
  difficulty: DsaDifficulty;
  status: DsaStatus;
  masteryPercent: number | null; // 0..100 from the tracker, if present
  url: string | null;            // external problem link
  platform: string | null;       // "leetcode" | "gfg" | ...
  lastSolvedAt: Date | null;
  notes: string | null;
}

export interface DsaPattern {
  key: string;
  name: string;
  totalProblems: number;
  solvedProblems: number;
  orderIndex: number;
}

export async function getProblemsForUser(userId: string): Promise<DsaProblem[]>;
export async function getProblemById(userId: string, problemId: string): Promise<DsaProblem | null>;
export async function getPatterns(userId: string): Promise<DsaPattern[]>;
export function trackerProblemUrl(problemId: string): string;   // deep link back into the tracker
```

### 4.2 Implementation instruction for the agent

1. Open the existing Prisma schema (or equivalent).
2. Identify the models backing the **Problems** and **Patterns** pages, and whatever model stores
   per-user solve status and mastery percent.
3. Implement the four functions against those models using the **existing** Prisma client.
4. Map their status enum onto `DsaStatus`. The tracker in the reference screenshots uses
   `Not started` / `Solved` / `Revised` — map `Revised` to `'REVISED'`.
5. If `lastSolvedAt` does not exist, return `null`; the scheduler handles it (§5.3).
6. If `patternKey` does not exist as a stable slug, derive one:
   `slugify(patternName)` and keep it stable.
7. Add a unit test asserting the adapter performs **zero writes** (assert against a Prisma
   middleware that throws on any `create`/`update`/`delete` to non-`revision` models).

---

## 5. The scheduling engine — the core of the product

`lib/revision/scheduler.ts`. This is the most important file. It implements a four-touch first
ladder followed by interval doubling, plus a decay rule.

### 5.1 Card state

```ts
interface CardState {
  level: 0|1|2|3|4|5;      // the mastery ladder
  ladderStep: 0|1|2|3|4;   // 0=T1 recall, 1=T2 skeleton, 2=T3 cold, 3=T4 timed, 4=interval mode
  intervalDays: number;
  dueAt: Date;
  lastReviewedAt: Date | null;
  consecutivePasses: number;
  lapses: number;
  decayed: boolean;
  isAnchor: boolean;
  suspended: boolean;
}
```

**The mastery ladder** (display this in the UI, it is the product's vocabulary):

| Level | Name | Meaning | Counts as retained? |
|---|---|---|---|
| L0 | Untouched | Not attempted | No |
| L1 | Assisted | Solved with editorial/hint | No |
| L2 | Unaided once | Solved alone once, slowly | No |
| L3 | Cold re-solve | Re-solved ≥3 days later, no help | **Yes** |
| L4 | Timed | Cold re-solve inside the time bar, can state complexity | **Yes** |
| L5 | Teachable | Can derive the template blank-page and name two variants | **Yes** |

### 5.2 Sync from the tracker

```ts
async function syncCards(userId: string) {
  const problems = await adapter.getProblemsForUser(userId);
  for (const p of problems) {
    if (p.status === 'NOT_STARTED') continue;      // nothing to revise yet

    const existing = await db.reviewCard.findUnique({ where: { userId_problemId: {...} } });

    if (!existing) {
      await db.reviewCard.create({ data: {
        userId, problemId: p.id,
        patternKey: p.patternKey,
        difficulty: p.difficulty,
        level: mapInitialLevel(p),
        ladderStep: 0,
        intervalDays: 1,
        dueAt: addDays(p.lastSolvedAt ?? new Date(), 1),
        consecutivePasses: p.status === 'REVISED' ? 1 : 0,
      }});
    } else {
      // REFRESH DENORMALISED FIELDS ONLY. NEVER touch scheduling state.
      await db.reviewCard.update({ where: { id: existing.id },
        data: { patternKey: p.patternKey, difficulty: p.difficulty } });
    }
  }
}

function mapInitialLevel(p: DsaProblem): number {
  if (p.masteryPercent == null) return p.status === 'REVISED' ? 2 : 1;
  if (p.masteryPercent <= 0)  return 0;
  if (p.masteryPercent <= 20) return 1;
  if (p.masteryPercent <= 40) return 2;
  if (p.masteryPercent <= 60) return 3;
  if (p.masteryPercent <= 80) return 4;
  return 5;
}
```

Sync triggers: on revision dashboard load if `lastSyncAt` is older than 10 minutes, and on an
explicit "Sync from tracker" button. Never on a cron that could race with the tracker.

### 5.3 The four-touch first ladder

A newly-synced card walks four touches before entering interval mode. This is the retention
protocol; it is not optional.

| Step | Mode | Offset from solve | What the UI asks for | Time |
|---|---|---|---|---|
| T1 | `RECALL` | same day (+0) | No code. State the approach, data structure and complexity out loud. | 2 min |
| T2 | `SKELETON` | +2 days | Write the code skeleton on paper. Loop shape and key lines only. | 5 min |
| T3 | `COLD` | +7 days | Full re-solve in the IDE, timer running, no notes. **This is the touch that sets L3.** | 15 min |
| T4 | `TIMED` | +21 days | Cold re-solve inside the interview-ready bar. | 10 min |

If `lastSolvedAt` is `null`, start the ladder from `now`.

After T4 the card enters **interval mode** (`ladderStep = 4`).

### 5.4 Outcomes and transitions

```ts
type Outcome = 'PASS_FAST' | 'PASS' | 'SLOW' | 'FAIL';

// PASS_FAST : correct, within the INTERVIEW bar   (E 6 / M 15 / H 30 min)
// PASS      : correct, within the COLD bar        (E 10 / M 20 / H 35 min)
// SLOW      : correct, over the cold bar
// FAIL      : incorrect, gave up, or used any hint

function applyReview(s: CardState, outcome: Outcome, settings: Settings): CardState {
  const next = { ...s, lastReviewedAt: new Date(), decayed: false };

  // --- first ladder ---
  if (s.ladderStep < 4) {
    if (outcome === 'FAIL') {
      // repeat this step in 2 days, drop a level
      next.level = Math.max(1, s.level - 1) as CardState['level'];
      next.lapses = s.lapses + 1;
      next.consecutivePasses = 0;
      next.dueAt = addDays(new Date(), 2);
      return next;
    }
    next.ladderStep = (s.ladderStep + 1) as CardState['ladderStep'];
    if (s.ladderStep === 2 && outcome !== 'SLOW') next.level = Math.max(s.level, 3);
    if (s.ladderStep === 3 && outcome === 'PASS_FAST') next.level = Math.max(s.level, 4);
    next.dueAt = addDays(new Date(), [2, 5, 14, 0][s.ladderStep]);   // T1→T2 +2, T2→T3 +5, T3→T4 +14
    if (next.ladderStep === 4) {
      next.intervalDays = 7;
      next.dueAt = addDays(new Date(), 7);
    }
    return next;
  }

  // --- interval mode ---
  switch (outcome) {
    case 'PASS_FAST':
      next.level = Math.min(5, s.level + 1) as CardState['level'];
      next.consecutivePasses = s.consecutivePasses + 1;
      next.intervalDays = next.consecutivePasses >= 2 ? s.intervalDays * 2 : s.intervalDays;
      break;
    case 'PASS':
      next.level = Math.max(s.level, 3) as CardState['level'];
      next.consecutivePasses = s.consecutivePasses + 1;
      next.intervalDays = next.consecutivePasses >= 2 ? s.intervalDays * 2 : s.intervalDays;
      break;
    case 'SLOW':
      next.consecutivePasses = 0;
      next.intervalDays = Math.max(3, Math.floor(s.intervalDays / 2));
      break;
    case 'FAIL':
      next.level = Math.max(1, s.level - 1) as CardState['level'];
      next.consecutivePasses = 0;
      next.lapses = s.lapses + 1;
      next.intervalDays = 3;
      break;
  }

  const cap = s.isAnchor ? settings.anchorMaxIntervalDays : settings.maxIntervalDays; // 30 / 60
  next.intervalDays = Math.min(next.intervalDays, cap);
  next.dueAt = addDays(new Date(), next.intervalDays);
  return next;
}
```

**Anchor rule:** anchors never leave rotation. Their interval is capped at 30 days regardless of
how many times they pass.

**Pattern-failure trigger:** after every `FAIL`, count fails for that `patternKey` in the last
7 days. If ≥ 2, create a `RepairTask` for that pattern with priority = fail count. This is what
drives the "Pattern Decay" panel and the repair queue.

### 5.5 The decay rule

Levels expire. Run this lazily on dashboard load (cheaper than a cron, and idempotent):

```ts
async function applyDecay(userId: string, settings: Settings) {
  const cutoff = subDays(new Date(), settings.decayDays); // default 30
  await db.reviewCard.updateMany({
    where: { userId, level: { gte: 3 }, decayed: false, lastReviewedAt: { lt: cutoff } },
    data:  { level: { decrement: 1 }, decayed: true },
  });
}
```

A decayed card is visually flagged in every list. Decayed anchors are surfaced as an alert on the
dashboard: *"Anchor not touched in 30 days."*

### 5.6 Optional mastery write-back (default OFF)

```ts
// .env
REVISION_ENABLE_MASTERY_WRITEBACK=false
```

When enabled, after a review the app updates **only** the tracker's mastery percent field to
`level * 20`. No other field. Guard it behind the flag, log every write, and never enable it by
default. The user's constraint is that the tracker must not be disturbed; this is opt-in only.

---

## 6. Data model

### 6.1 Prisma schema additions

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "revision"]     // "public" = existing app. Do not modify its models.
}

enum RevDifficulty { EASY MEDIUM HARD UNKNOWN                @@schema("revision") }
enum RevMode       { RECALL SKELETON COLD TIMED INTERLEAVED REPAIR DRILL MOCK_OA @@schema("revision") }
enum RevOutcome    { PASS_FAST PASS SLOW FAIL SKIPPED        @@schema("revision") }
enum RevIdResult   { INSTANT GOT_THERE WRONG NO_IDEA         @@schema("revision") }
enum RevDrillResult{ CLEAN PARTIAL BLANK                     @@schema("revision") }
enum RevSessionKind{ DAILY_LOOP REPAIR INTERLEAVED MOCK_OA DRILL_40 PLAYBOOK_DAY FREE @@schema("revision") }
enum RevTaskStatus { OPEN IN_PROGRESS DONE DISMISSED         @@schema("revision") }

model ReviewCard {
  id                String        @id @default(cuid())
  userId            String
  problemId         String        // value-FK to the tracker's problem id (no DB-level FK across schemas)
  patternKey        String
  difficulty        RevDifficulty @default(UNKNOWN)

  level             Int           @default(0)   // 0..5
  ladderStep        Int           @default(0)   // 0..4
  intervalDays      Int           @default(1)
  dueAt             DateTime
  lastReviewedAt    DateTime?
  consecutivePasses Int           @default(0)
  lapses            Int           @default(0)
  decayed           Boolean       @default(false)
  suspended         Boolean       @default(false)

  isAnchor          Boolean       @default(false)
  anchorRank        Int?

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  logs              ReviewLog[]
  mistakes          Mistake[]
  sessionItems      SessionItem[]

  @@unique([userId, problemId])
  @@index([userId, dueAt])
  @@index([userId, patternKey, level])
  @@index([userId, isAnchor])
  @@schema("revision")
}

model ReviewLog {
  id             String     @id @default(cuid())
  userId         String
  cardId         String
  card           ReviewCard @relation(fields: [cardId], references: [id], onDelete: Cascade)
  sessionId      String?
  session        Session?   @relation(fields: [sessionId], references: [id])

  mode           RevMode
  outcome        RevOutcome
  durationSec    Int?
  usedHint       Boolean    @default(false)
  levelBefore    Int
  levelAfter     Int
  intervalBefore Int
  intervalAfter  Int
  createdAt      DateTime   @default(now())

  @@index([userId, createdAt])
  @@index([cardId, createdAt])
  @@schema("revision")
}

model Mistake {
  id         String      @id @default(cuid())
  userId     String
  cardId     String?
  card       ReviewCard? @relation(fields: [cardId], references: [id], onDelete: SetNull)
  patternKey String

  missed     String      @db.Text   // "forgot to skip duplicates for l and r after a match"
  why        String      @db.Text   // "I assume the outer dedup covers the inner. It doesn't."
  cue        String      @db.Text   // "dedup fires three times in 3Sum: outer i, inner l, inner r"

  starred    Boolean     @default(false)
  resolved   Boolean     @default(false)
  createdAt  DateTime    @default(now())

  @@index([userId, createdAt])
  @@index([userId, patternKey])
  @@schema("revision")
}

model Template {
  id         String          @id @default(cuid())
  key        String          @unique          // "A09-monotonic-stack"
  patternKey String
  name       String
  language   String          @default("java")
  code       String          @db.Text
  note       String?         @db.Text
  triggers   String[]
  orderIndex Int             @default(0)
  drills     TemplateDrill[]

  @@index([patternKey])
  @@schema("revision")
}

model TemplateDrill {
  id          String         @id @default(cuid())
  userId      String
  templateId  String
  template    Template       @relation(fields: [templateId], references: [id], onDelete: Cascade)
  sessionId   String?
  result      RevDrillResult
  durationSec Int?
  createdAt   DateTime       @default(now())

  @@index([userId, createdAt])
  @@schema("revision")
}

model Session {
  id            String         @id @default(cuid())
  userId        String
  kind          RevSessionKind
  patternKey    String?
  targetMinutes Int?
  startedAt     DateTime       @default(now())
  endedAt       DateTime?
  score         Json?          // { total, clean, slow, failed, notIdentified }
  items         SessionItem[]
  logs          ReviewLog[]

  @@index([userId, startedAt])
  @@schema("revision")
}

model SessionItem {
  id          String       @id @default(cuid())
  sessionId   String
  session     Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  cardId      String?
  card        ReviewCard?  @relation(fields: [cardId], references: [id], onDelete: SetNull)
  templateId  String?
  orderIndex  Int
  startedAt   DateTime?
  outcome     RevOutcome?
  idResult    RevIdResult?
  durationSec Int?

  @@index([sessionId, orderIndex])
  @@schema("revision")
}

model RepairTask {
  id          String        @id @default(cuid())
  userId      String
  patternKey  String
  reason      String        // "2 fails in 7 days" | "interleaved miss" | "manual" | "decayed anchors"
  priority    Int           @default(0)
  status      RevTaskStatus @default(OPEN)
  createdAt   DateTime      @default(now())
  completedAt DateTime?

  @@index([userId, status, priority])
  @@schema("revision")
}

model PatternHealth {
  id           String   @id @default(cuid())
  userId       String
  patternKey   String
  score        Int                  // 0..100
  l3PlusCount  Int
  totalCards   Int
  decayedCount Int
  dueCount     Int
  computedAt   DateTime @default(now())

  @@unique([userId, patternKey])
  @@schema("revision")
}

model RevisionSettings {
  userId                String   @id
  timeBarEasyMin        Int      @default(10)
  timeBarMediumMin      Int      @default(20)
  timeBarHardMin        Int      @default(35)
  interviewBarEasyMin   Int      @default(6)
  interviewBarMediumMin Int      @default(15)
  interviewBarHardMin   Int      @default(30)
  dailyLoopMinutes      Int      @default(25)
  decayDays             Int      @default(30)
  maxIntervalDays       Int      @default(60)
  anchorMaxIntervalDays Int      @default(30)
  dailyNewLimit         Int      @default(0)     // this app does not introduce new problems
  dailyReviewLimit      Int      @default(20)
  activePlaybook        String?
  playbookStartedAt     DateTime?
  lastSyncAt            DateTime?
  lastDecayRunAt        DateTime?

  @@schema("revision")
}
```

### 6.2 Cross-schema reference note

`ReviewCard.problemId` is a **value reference**, not a database foreign key — Prisma cannot express
FKs across schemas cleanly and a real FK would couple the revision migrations to the tracker's.
Enforce integrity in the sync job: cards whose `problemId` no longer resolves via the adapter get
`suspended = true` rather than being deleted.

### 6.3 Migration plan

```
migration 001_revision_schema
  - CREATE SCHEMA IF NOT EXISTS revision;
  - create all enums and tables above
  - no ALTER on any existing table
migration 002_revision_seed_templates      (data migration, idempotent upsert by Template.key)
migration 003_revision_seed_anchors        (marks isAnchor on cards by problem title match, idempotent)
```

### 6.4 Pattern health scoring — `lib/revision/health.ts`

```ts
const LEVEL_WEIGHT = [0, 15, 35, 60, 80, 100];   // index = level

function cardScore(c: ReviewCard, now: Date): number {
  const base = LEVEL_WEIGHT[c.level];
  const days = c.lastReviewedAt ? differenceInDays(now, c.lastReviewedAt) : 60;
  const decayMult = Math.max(0.5, 1 - days / 60);
  return base * decayMult;
}

function patternHealth(cards: ReviewCard[], totalProblemsInPattern: number): number {
  if (cards.length === 0) return 0;
  const mastery  = mean(cards.map(c => cardScore(c, new Date())));      // 0..100
  const coverage = (cards.length / totalProblemsInPattern) * 100;       // 0..100
  return Math.round(0.7 * mastery + 0.3 * coverage);
}
```

Bands for the UI: `< 40` red, `40–59` orange, `60–79` amber, `≥ 80` green. This reproduces the
mockup's Weak Areas bars, but driven by decay rather than solve count.

Recompute on dashboard load, cache in `PatternHealth`, invalidate on any review write.

---

## 7. Screens

### 7.1 Dashboard — `/revision`

Layout follows the supplied mockup. Grid, top to bottom:

**Header row**
- Greeting + subtitle.
- Streak pill (consecutive days with ≥1 review).
- Total cards pill.

**Stat tiles (4 across)**
1. `Due Today` — count + "Review Now →" to `/revision/queue?filter=today`
2. `Due This Week` — count + "Plan →" to `/revision/playbook`
3. `Retained (L3+)` — `47 / 111` with a three-segment bar (L3 / L4 / L5)
4. `Retention Rate` — ring chart, pass ÷ attempts on COLD+TIMED over 30 days

**Row 2**
- **Revision Calendar** — GitHub-style heatmap, 12 weeks, cell intensity = reviews that day.
  Clicking a cell opens that day's log.
- **Pattern Decay** — top 5 patterns by lowest health score, coloured bars, "View all" →
  `/revision/stats#patterns`. Each row is clickable → `/revision/repair/[patternKey]`.

**Row 3**
- **Upcoming Reviews** — next 5 due cards. Each shows title, pattern tag, due label, difficulty,
  and the touch it is on (T1/T2/T3/T4 or the interval). Overflow menu: *Start now*, *Snooze 1 day*,
  *Suspend*, *Open in tracker*.
- **Recent Activity** — last 5 `ReviewLog` entries with outcome icon (green check, amber clock,
  red cross), pattern tag, relative time.

**Row 4**
- **Your Progress** — line chart, series selector `L3+ | Retention rate | Reviews/day`,
  range selector `This week | This month | All time`. Donut on the right showing level
  distribution L1–L5.

**Row 5**
- Quote banner (keep from the mockup).

**Alerts** — render above the stat tiles when triggered:
- `N anchors have not been touched in 30 days.` → `/revision/anchors`
- `Pattern X has failed twice this week.` → `/revision/repair/x`
- `Interleaved test is overdue.` → `/revision/test`

### 7.2 Daily Loop — `/revision/today`

The 25-minute guided routine. Four steps, one screen each, with a progress rail across the top.

| Step | Minutes | Content |
|---|---|---|
| 1. Template | 3 | One template from the rotation, hidden. "Write it from memory, then reveal." Reveal → self-grade `Clean / Partial / Blank`. Writes a `TemplateDrill`. |
| 2. Identify | 5 | Five cards, title + statement snippet only, 60s each. Self-report `Instant / Got there / Wrong / No idea`. Writes `SessionItem.idResult`. |
| 3. Re-solve | 15 | One due card, longest overdue first. Timer with the difficulty bar shown as a shrinking track. Outcome buttons. On FAIL, the mistake-log form appears inline and must be filled before continuing. |
| 4. Log | 2 | Summary. What moved, what reset, tomorrow's preview. |

Template rotation: round-robin over `Template.orderIndex`, tracked in `RevisionSettings`.

The whole loop is one `Session` with `kind = DAILY_LOOP`.

### 7.3 Review Queue — `/revision/queue`

Filterable list. Filters: `Due today | Overdue | This week | Anchors | Decayed | Pattern | Difficulty | Level`.
Sort: `Most overdue | Lowest level | Pattern | Difficulty`.

Bulk actions: *Start session with selected*, *Snooze*, *Suspend*.

Each row: title · pattern tag · difficulty pill · level chip (L2) · due label · overdue days badge ·
platform icon · overflow menu.

Primary button: **Start review session** → creates a `Session(kind=FREE)` and routes to the runner.

### 7.4 Review Runner — `/revision/review/[cardId]`

The screen where the actual work happens. Design it to be distraction-free — no sidebar.

```
┌──────────────────────────────────────────────────────────────┐
│  Two Pointers  ·  MEDIUM  ·  L2  ·  T3 Cold re-solve         │
│                                                              │
│                Triplet Sum to Zero                           │
│                                                              │
│   ⏱  14:22 remaining        [████████░░░░░░░]  cold bar 20m  │
│                                                              │
│   [ Open problem ↗ ]   [ Open in tracker ↗ ]                 │
│                                                              │
│   ⚠ Notes, templates and past attempts are hidden until      │
│      you record an outcome. That is the point.               │
│                                                              │
│   How did it go?                                             │
│   [ Clean & fast ]  [ Clean ]  [ Correct but slow ]  [ Failed ] │
│                                                              │
│   ☐ I used a hint or looked at my notes                      │
└──────────────────────────────────────────────────────────────┘
```

Rules:
- The template, the note and prior mistakes are **hidden** until an outcome is recorded. Reveal only
  after. This enforces "blank page before notes".
- Ticking "I used a hint" forces the outcome to `FAIL` regardless of which button was pressed.
- Timer start time is stored **server-side** (`SessionItem.startedAt`) so a refresh cannot game it.
- Elapsed time auto-classifies the button labels against the bars: if elapsed > cold bar, the
  "Clean & fast" and "Clean" buttons are disabled and the UI says *over the bar*.
- On `FAIL`, the mistake form is mandatory: three fields (`missed`, `why`, `cue`), all required.
- After submitting: show what changed — level before → after, next due date, interval — then
  "Next card" or "End session".

### 7.5 Repair Session — `/revision/repair/[patternKey]`

The 90-minute pattern repair engine, as a guided five-phase wizard.

| Phase | Min | Screen |
|---|---|---|
| 1. Blank page | 10 | Template name only, code hidden. Textarea to type it from memory. Timer. |
| 2. Repair | 15 | Side-by-side diff: what you wrote vs the real template. Highlight differences. Self-grade. |
| 3. Cold anchors | 45 | Three anchor cards for this pattern, run through the Review Runner in sequence, 15-min cap each. |
| 4. Gap note | 10 | Mistake-log entries for each failure. Pre-filled with the card title. |
| 5. Re-grade | 10 | Summary table: each card's level before/after, next due. Auto-suggests the outcome per §5 of the reading: 3/3 → next in 14d, 2/3 → 7d, 1/3 → repeat in 48h, 0/3 → treat as new. |

Creates one `Session(kind=REPAIR, patternKey)`. On completion, closes any open `RepairTask` for
that pattern.

### 7.6 Templates — `/revision/templates`

Grid of template cards grouped by pattern. Each card: name, pattern tag, last drill result, days
since last drill. Click → detail with code (syntax highlighted, Java), the note, trigger signals,
and a **Drill** button that hides the code and starts a blank-page attempt.

Rotation indicator: "Next in rotation: A09 · Monotonic stack".

### 7.7 Identification Drill — `/revision/drill`

Configurable rep count (default 40, 5 for the daily loop). Shows title + a short statement snippet,
never the pattern tag. 60-second countdown per rep, auto-advance. Four self-report buttons.

Result screen: score out of N, breakdown by category, and the band interpretation
(`32+ instant` = OA-ready · `24–31` = functional but slow · `16–23` = this is your bottleneck ·
`<16` = run a repair sprint). Patterns with `WRONG` or `NO_IDEA` generate `RepairTask`s.

### 7.8 Interleaved Test — `/revision/test`

Weekly. Generator rules:
- 10 cards
- from ≥ 8 distinct patterns
- `lastReviewedAt` older than 21 days
- prefer level 2–4 (level 5 is too easy, level ≤1 is unfair)
- **pattern tags hidden throughout**
- one 90-minute timer for all ten, not per problem

Scoring per item: `Clean / Slow / Identified but failed / Didn't identify`.
"Didn't identify" is the red category — it creates a high-priority `RepairTask`.

Result screen shows the score, the per-pattern breakdown (revealed only now), and a generated
plan for the week: which patterns lead.

### 7.9 Mistake Log — `/revision/mistakes`

Reverse-chronological, append-only (edit allowed for 10 minutes, then locked). Filter by pattern,
star, resolved. Search across `missed` / `why` / `cue`.

**Read-before-OA mode**: a full-screen, distraction-free reader that shows one entry at a time,
starred first, with a "mark as internalised" action.

### 7.10 Anchors — `/revision/anchors`

The permanent-rotation board. Table: rank, pattern, problem, and four date columns showing the last
four cold-solve dates with pass/fail colouring. Rows with no tick in 30 days render in red.

Add/remove anchors manually. Seeded from §11.2.

### 7.11 Playbooks — `/revision/playbook`

Pick a protocol: `24 hours | 72 hours | 7 days | 14 days | 28 days | Daily only`. Selecting one
generates a day-by-day plan of `Session` stubs with pre-filled item lists, shown as a checklist.
Store `activePlaybook` and `playbookStartedAt` in settings; the dashboard then shows "Day 3 of 7 —
Cards 8 and 4 today".

### 7.12 Stats — `/revision/stats`

- L3+ over time (the headline chart)
- Retention rate over time
- Identification score history
- Pattern health table with sparklines
- Review volume heatmap
- Time-per-problem distribution vs the bars
- Lapse leaderboard: the ten cards that have failed most often

### 7.13 OA Mode — `/revision/oa-mode`

A single-purpose screen for the night before. Takes a target company (optional) and produces:
1. The starred mistake-log entries, in reader mode
2. The five templates most relevant to that company's pattern weighting
3. A 20-rep identification drill
4. An environment checklist
5. A hard stop banner: *"Stop by 9 PM. Eight hours of sleep is worth more than two more problems."*

No new problems can be started from this screen. That restriction is the feature.

---

## 8. Design system

Match the supplied mockup. Dark by default, light theme optional.

```css
/* scope everything under .revision-root to avoid touching the tracker's styles */
--rev-bg:            #080B14;
--rev-surface:       #0E1421;
--rev-surface-2:     #141B2D;
--rev-border:        #1E2739;
--rev-text:          #E8ECF4;
--rev-text-muted:    #8A97AE;

--rev-accent:        #7C5CFF;   /* primary purple */
--rev-accent-soft:   #A78BFA;
--rev-accent-bg:     #1A1533;

--rev-success:       #22C55E;   /* L4/L5, pass */
--rev-warn:          #F59E0B;   /* slow, medium */
--rev-danger:        #EF4444;   /* fail, hard, decayed */
--rev-info:          #38BDF8;

--rev-radius:        14px;
--rev-radius-sm:     10px;
--rev-shadow:        0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25);
```

Level chips: L1 grey · L2 slate · L3 blue · L4 green · L5 purple.
Difficulty pills: Easy green · Medium amber · Hard red.
Decayed cards get a red left border and a small "decayed" badge.

Fonts: keep the tracker's font. Code blocks use a monospace stack (`ui-monospace, JetBrains Mono,
Menlo, monospace`) at 13px.

Charts: use whatever the tracker already uses (Recharts if unspecified). Do not introduce a second
charting library.

---

## 9. Server actions and queries

All writes are server actions in `lib/revision/actions.ts`; all reads are in
`lib/revision/queries.ts`. No REST routes unless a client component genuinely needs one.

```ts
// actions.ts
'use server';
export async function syncFromTracker(): Promise<{ created: number; refreshed: number }>;
export async function startSession(kind: RevSessionKind, opts?: {...}): Promise<string>;
export async function beginItem(sessionId: string, cardId: string): Promise<void>;   // sets startedAt
export async function recordReview(input: {
  cardId: string; sessionId?: string; mode: RevMode;
  outcome: RevOutcome; usedHint: boolean; durationSec: number;
}): Promise<{ levelBefore: number; levelAfter: number; nextDueAt: Date; intervalDays: number }>;
export async function recordMistake(input: { cardId?: string; patternKey: string;
  missed: string; why: string; cue: string }): Promise<void>;
export async function recordTemplateDrill(templateId: string, result: RevDrillResult,
  durationSec?: number): Promise<void>;
export async function recordIdentification(sessionItemId: string, result: RevIdResult): Promise<void>;
export async function endSession(sessionId: string): Promise<SessionScore>;
export async function toggleAnchor(cardId: string, isAnchor: boolean): Promise<void>;
export async function snoozeCard(cardId: string, days: number): Promise<void>;
export async function suspendCard(cardId: string, suspended: boolean): Promise<void>;
export async function generateInterleavedTest(): Promise<string>;   // returns sessionId
export async function startPlaybook(key: PlaybookKey): Promise<void>;

// queries.ts
export async function getDashboard(userId: string): Promise<DashboardData>;
export async function getQueue(userId: string, filter: QueueFilter): Promise<QueueRow[]>;
export async function getCard(userId: string, cardId: string): Promise<CardDetail>;
export async function getPatternHealth(userId: string): Promise<PatternHealthRow[]>;
export async function getHeatmap(userId: string, weeks: number): Promise<HeatmapCell[]>;
export async function getMistakes(userId: string, filter: MistakeFilter): Promise<Mistake[]>;
export async function getNextTemplateInRotation(userId: string): Promise<Template>;
```

`getDashboard` must run `applyDecay` and, if `lastSyncAt` is stale, `syncFromTracker` before
computing. Both are idempotent.

### 9.1 Deep-link contract between the two apps

| From | To | Path |
|---|---|---|
| Tracker sidebar | Revision Hub | `/revision` |
| Tracker problem row → "Revise" | Card detail | `/revision/queue?problem=<problemId>` |
| Tracker pattern page → "Repair" | Repair session | `/revision/repair/<patternKey>` |
| Revision card → "Open in tracker" | Tracker problem | `adapter.trackerProblemUrl(problemId)` |
| Revision pattern chip | Tracker pattern | `/patterns/<patternKey>` |

If a `problemId` in a deep link has no card yet, create one on the fly via sync, then route.

---

## 10. Testing and acceptance

### 10.1 Non-disturbance tests (write these first, they are the contract)

```ts
test('adapter performs no writes', ...)                 // Prisma middleware throws on write outside revision
test('no revision code imports tracker models directly', ...)  // static check: only dsa-adapter.ts may
test('migration touches no existing table', ...)        // parse the generated SQL, assert no ALTER on public.*
test('tracker pages render unchanged', ...)             // snapshot the existing routes before/after
```

### 10.2 Scheduler tests

```
- new card walks T1 → T2 → T3 → T4 → interval mode with the correct offsets
- FAIL at T3 drops the level, sets due +2 days, keeps ladderStep
- two consecutive passes in interval mode doubles the interval
- one SLOW halves the interval and resets consecutivePasses
- interval is capped at 60, or 30 for anchors
- a card untouched for 31 days at level 4 decays to level 3 exactly once
- two FAILs on the same pattern within 7 days create exactly one RepairTask
- usedHint = true forces outcome FAIL regardless of the button pressed
- timer cannot be reset by a page refresh (startedAt is server-side)
```

### 10.3 Acceptance criteria per phase

**Phase 1 is done when:** you can open `/revision`, see real cards synced from the tracker, start a
review, be timed, record an outcome, be forced into the mistake log on failure, and see the card's
due date move — and the tracker's Problems page is byte-identical to before.

---

## 11. Seed data

### 11.1 Templates

Seed 19 templates from the pattern library, `orderIndex` 1–19, all Java:

```
A01 two-pointers          Converging pointers (3Sum shape)
A02 fast-slow             Floyd cycle detection + entry point
A03 sliding-window        Variable window, longest and shortest forms
A04 monotonic-deque       Sliding window maximum
A05 kadane                Max subarray, product, circular
A06 prefix-sum            Prefix + HashMap, count and longest forms
A07 intervals             Merge, scheduling greedy, sweep
A08 ll-reversal           Groups of k with a dummy node
A09 monotonic-stack       Next greater + histogram with sentinel
A10 binary-search         Lower bound and binary search on the answer
A11 heap                  Top-K with a size-k heap, and two heaps
A12 backtracking          Choose / explore / un-choose, both dedup rules
A13 tree-bottom-up        Return one thing, record another
A14 tree-top-down-bst     Pass state down; the BST range invariant
A15 tree-level-construct  Level order with the size freeze; construction
A16 graph-bfs-dfs-kahn    BFS, DFS, topological sort
A17 graph-dsu-dijkstra    Union-Find with path compression; Dijkstra
A18 dp                    1D, grid, 0/1 vs unbounded knapsack, LCS, LIS
A19 trie                  Node, insert, walk
```

Store the code bodies in `lib/revision/seed/templates.ts` as template literals. Seeding is an
idempotent upsert keyed on `Template.key`.

### 11.2 Anchors

39 anchors, three per pattern, matched to tracker problems by title on first sync. Store as
`{ patternKey, title, rank }` in `lib/revision/seed/anchors.ts`. If a title does not match, log a
warning and skip — never create a phantom card.

```
two-pointers    : Triplet Sum to Zero · Sort Colors · Subarrays with Product Less than Target
fast-slow       : Start of LinkedList Cycle · Find Duplicate Number · Palindrome LinkedList
sliding-window  : No-repeat Substring · Longest Substring with Same Letters after Replacement ·
                  Smallest Subarray with given sum
kadane          : Maximum Subarray Sum · Maximum Product Subarray · Maximum Sum Circular Subarray
prefix-sum      : Subarray Sum Equals K · Contiguous Array · Subarray Sums Divisible by K
intervals       : Merge Intervals · Minimum Meeting Rooms · Insert Interval
ll-reversal     : Reverse a Sub-list · Reverse every K-element Sub-list · Rotate a LinkedList
stack           : Next Greater Element · Daily Temperatures · Remove All Adjacent Duplicates in String II
hash-maps       : Longest Palindrome · First Non-repeating Character · Ransom Note
binary-search   : Search in Rotated Sorted Array · KOKO Eating Bananas · Book Allocation Problem
heap            : Top K Frequent Elements · Merge K Sorted Arrays · Reorganize String
backtracking    : Permutations · Combination Sum · Palindrome Partitioning
trees           : Binary Tree Level Order Traversal · Binary Tree Zigzag Level Order Traversal ·
                  Symmetric Tree
```

Pending anchors, activated once those problems exist as solved cards:
`graphs: Number of Islands · Course Schedule II · Number of Provinces`
`dp: Coin Change · Longest Increasing Subsequence · Best Time to Buy and Sell Stock II`

---

## 12. Build phases — build in this order, stop at the end of each

### Phase 1 — The engine (~10–12 h). Ship this and stop.
- [ ] Prisma schema + migration 001
- [ ] `dsa-adapter.ts` + the no-write test
- [ ] `scheduler.ts` + its unit tests
- [ ] `syncFromTracker`
- [ ] `/revision` dashboard: four stat tiles, Upcoming Reviews, Recent Activity
- [ ] `/revision/queue` with filters
- [ ] `/revision/review/[cardId]` runner with server-side timer and forced mistake capture
- [ ] `/revision/mistakes` list
- [ ] Sidebar: remove the old Revisions item, add Revision Hub

**Everything below is optional.** Phase 1 already implements the four-touch schedule, which is
the entire point of the product.

### Phase 2 — The routine (~8 h)
- [ ] `/revision/today` daily loop, four steps
- [ ] Templates seed + `/revision/templates` + blank-page drill
- [ ] Pattern Decay panel + `health.ts`
- [ ] Revision calendar heatmap
- [ ] `RepairTask` generation and dashboard alerts

### Phase 3 — The diagnostics (~10 h)
- [ ] `/revision/repair/[patternKey]` five-phase wizard
- [ ] `/revision/drill` identification drill with banding
- [ ] `/revision/test` interleaved test generator and scoring
- [ ] Anchors seed + `/revision/anchors` board

### Phase 4 — Polish (~8 h)
- [ ] `/revision/playbook`
- [ ] `/revision/stats`
- [ ] `/revision/oa-mode`
- [ ] Light theme, keyboard shortcuts, CSV export

---

## 13. Non-goals — do not build these

- Any way to mark a problem solved for the first time. That belongs to the tracker.
- Editing problem metadata, patterns, or the sheet.
- A second notes system. The mistake log is deliberately narrow: missed / why / cue.
- Social features, leaderboards, sharing.
- An in-app code editor. The user solves in their IDE. This app only times and grades.
- Notifications or email. A daily habit does not need a push.
- AI hint generation. Hints defeat the entire mechanism.

---

## 14. Open decisions for the user

1. **Write-back**: leave `REVISION_ENABLE_MASTERY_WRITEBACK=false`, or turn it on so the tracker's
   mastery bars reflect real retention? Recommendation: leave it off until Phase 3 is stable.
2. **Multi-user**: is the tracker single-user? If so, `userId` can be a constant, but keep the
   column — it costs nothing and avoids a migration later.
3. **Statement snippets**: the identification drill is much better with a one-line problem
   statement. If the tracker stores one, expose it on `DsaProblem`. If not, the drill falls back to
   title-only, which is weaker but still works.
