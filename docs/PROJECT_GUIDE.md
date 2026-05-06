# DSA Mission Control — Complete Project Guide

> This document is the single source of truth for understanding the DSA Mission Control project.  
> It is written for **future developers and AI coding agents** who need to extend, debug, or refactor this codebase.
>
> **v0.2.0 (June 2026)** — Phase 1 polish pass: redesigned dashboard around a "Today" hero card; mobile drawer sidebar; PWA install support; one-click `dev.bat` launcher; videos now have YouTube URLs with a search-by-title fallback; pattern auto-completion; daily log race fix. See §11 for the full resolved list.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Data Sources & Extraction](#2-data-sources--extraction)
3. [Tech Stack & Why](#3-tech-stack--why)
4. [Database Architecture](#4-database-architecture)
5. [Application Architecture](#5-application-architecture)
6. [Page-by-Page Breakdown](#6-page-by-page-breakdown)
7. [Core Business Logic](#7-core-business-logic)
8. [Design System](#8-design-system)
9. [File Tree Reference](#9-file-tree-reference)
10. [How to Add Content](#10-how-to-add-content)
11. [Known Limitations & Quirks](#11-known-limitations--quirks)
12. [Future Roadmap](#12-future-roadmap)
13. [Git Commit Strategy](#13-git-commit-strategy)
14. [Quick Reference for AI Agents](#14-quick-reference-for-ai-agents)

---

## 1. Project Vision

### What Is This?

DSA Mission Control is a **personal web application** — an operating system for DSA preparation. It is designed for a single user (Prakash) who is following a specific YouTube playlist and problem sheet to prepare for placement interviews.

### Why Not Just Use a Spreadsheet?

A spreadsheet can track "done/not done," but it can't:
- Predict when you'll finish based on your pace
- Automatically schedule spaced-repetition revisions
- Visualize consistency with a GitHub-style heatmap
- Show mastery scores that decay without revision
- Calculate placement readiness per pattern
- Hold you accountable with daily mission scores

### The Learning Flow

```
Watch video (theory + approach)
    → Solve related problems (practice)
        → Mark as solved (triggers revision schedule)
            → Revision 1 after 3 days
            → Revision 2 after 7 days
            → Revision 3 after 14 days
            → Revision 4 after 30 days
            → Revision 5 after 60 days
                → Mastery = 100%
```

### The Two Resources Being Tracked

1. **YouTube Playlist**: "DSA Patterns 2025 · Crack FAANG in 3 Months" by **Padho with Pratyush** (IIT alumni)
   - 114 videos (as of extraction date)
   - The playlist is *actively growing* — new videos are added regularly
   - Organized by DSA patterns (Two Pointers → DP)

2. **DSA Problem Sheet** (PDF): A curated list of 171 problems organized by the same patterns
   - Each pattern has sub-patterns (e.g., Binary Search → "Search Space on Answer")
   - Problems are from LeetCode and GeeksForGeeks
   - Some problems are marked as "Challenge" or "Homework"

Both resources were extracted from PDF screenshots using a Python script (`read_pdfs.py`) and manually curated into TypeScript seed files.

---

## 2. Data Sources & Extraction

### Original PDFs

Located in `docs/reference/`:
- `Sheet - DSA Patterns 2025.pdf` — The problem sheet with 171 problems
- `youtube playlist.pdf` — Screenshots of the YouTube playlist (114 videos)

### Extraction Process

1. **`read_pdfs.py`** (in project root) used PyMuPDF to extract text and images from PDFs
2. The extracted data was manually structured into TypeScript files:
   - `prisma/seed-data/patterns.ts` — 15 pattern definitions with descriptions
   - `prisma/seed-data/problems.ts` — 171 problems with URLs, difficulty, platform, sub-patterns
   - `prisma/seed-data/videos.ts` — 114 videos with episode numbers, titles, durations

### Important Notes About Video Data

- Video episode numbers in the seed data **don't always match** the YouTube playlist index (1-indexed).
  The `episodeNumber` field represents the video's position in our playlist (1–114), while the video titles
  may reference different lecture numbers (e.g., video #28 might be titled "Lecture 26").
- Some videos are "non-technical" (journey stories, announcements) — they're still included and mapped to
  the nearest pattern for organization.
- The `patternName` field in `videos.ts` maps to the `name` field in `patterns.ts`. The seed script uses
  this string match to create the foreign key relationship.

### Important Notes About Problem Data

- Each problem has a `url` field — this is the direct link to LeetCode or GFG.
- `subPattern` is a categorization within a pattern (e.g., "Cycle Detection" within "Fast & Slow Pointers").
- `isChallenge` and `isHomework` are boolean flags from the original sheet.
- `difficulty` was manually assigned during extraction (EASY/MEDIUM/HARD).

---

## 3. Tech Stack & Why

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 15 (App Router) | Server Components for fast data loading, Server Actions for mutations, file-based routing |
| **Language** | TypeScript | Type safety across DB ↔ server ↔ client boundary |
| **Styling** | TailwindCSS v4 | Rapid styling with custom design tokens via `@theme` |
| **Database** | SQLite via Prisma | No Docker/PostgreSQL available on dev machine. SQLite is file-based, zero-config, perfect for single-user |
| **ORM** | Prisma 6 | Type-safe queries, schema-as-code, auto-migrations, visual studio |
| **Charts** | Recharts | React-native charting library, works with SSR |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **Utilities** | date-fns, clsx, tailwind-merge | Date math, className composition |

### Why Prisma 6 (not 7)?

Prisma 7 introduced breaking changes requiring a `prisma.config.ts` adapter pattern that added unnecessary
complexity for SQLite. Prisma 6 uses the simple `url = "file:./dev.db"` in `schema.prisma`. The warning
about deprecation can be safely ignored until Prisma 7 stabilizes its SQLite story.

### Why Not Authentication?

This is a single-user personal tool. Adding auth would add complexity without value. The `UserSettings`
model has a hardcoded `id = "default"` for the single user.

---

## 4. Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    Pattern ||--o{ Video : has
    Pattern ||--o{ Problem : has
    Pattern ||--o| PatternNote : has
    Pattern ||--o{ StudySession : tracks
    Problem ||--o{ Revision : schedules
    DailyLog }o--|| UserSettings : uses

    Pattern {
        string id PK
        string name UK
        string description
        int order
        string status
        datetime startedAt
        datetime completedAt
    }

    Video {
        string id PK
        int episodeNumber
        string title
        string patternId FK
        string duration
        boolean watched
        datetime watchedAt
        string notes
    }

    Problem {
        string id PK
        string title
        string patternId FK
        string subPattern
        string difficulty
        string platform
        string url
        string status
        int attempts
        datetime solvedAt
        int revisionLevel
        int masteryScore
        boolean isChallenge
        boolean isHomework
    }

    Revision {
        string id PK
        string problemId FK
        datetime scheduledDate
        datetime completedDate
        int revisionNumber
        string status
    }

    StudySession {
        string id PK
        datetime startTime
        datetime endTime
        int durationMins
        string patternId FK
    }

    DailyLog {
        string id PK
        datetime date UK
        int targetVideos
        int targetProblems
        int targetStudyMins
        int completedVideos
        int completedProblems
        int completedStudyMins
        int missionScore
        boolean isStudyDay
        string journalEntry
    }

    PatternNote {
        string id PK
        string patternId FK UK
        string keyLearnings
        string mistakes
        string revisionNotes
    }

    UserSettings {
        string id PK
        datetime startDate
        datetime targetDate
        int dailyTargetVideos
        int dailyTargetProblems
        int dailyTargetStudyMins
    }
```

### Key Design Decisions

1. **Problem Status Enum** (stored as string):
   `NOT_STARTED` → `ATTEMPTED` → `SOLVED` → `REVISED` → `MASTERED`

2. **Revision Status**: `PENDING`, `COMPLETED`, `SKIPPED`

3. **Pattern Status**: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

4. **DailyLog unique on `date`**: One entry per calendar day. Created lazily when the first activity happens.

5. **Mastery Score**: 0–100, incremented by 20 per revision level. Stored on the Problem model for fast queries.

6. **No cascading deletes**: Prisma defaults to `Restrict`. Deleting a pattern would require removing all associated videos/problems first.

---

## 5. Application Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────────┐                   │
│  │ Server       │    │ Client           │                   │
│  │ Components   │    │ Components       │                   │
│  │ (page.tsx)   │    │ ("use client")   │                   │
│  │              │    │                  │                   │
│  │ - Fetch data │    │ - User actions   │                   │
│  │ - Render UI  │    │ - useTransition  │                   │
│  │ - Pass props │    │ - router.refresh │                   │
│  └──────┬───────┘    └────────┬─────────┘                   │
│         │                     │                             │
│         ▼                     ▼                             │
│  ┌──────────────────────────────────────┐                   │
│  │       Server Actions                 │                   │
│  │       (src/lib/actions.ts)           │                   │
│  │                                      │                   │
│  │  "use server" functions that run     │                   │
│  │  on the server. Can be called from   │                   │
│  │  both server and client components.  │                   │
│  └──────────────┬───────────────────────┘                   │
│                 │                                           │
│                 ▼                                           │
│  ┌──────────────────────────────────────┐                   │
│  │       Prisma ORM                     │                   │
│  │       (src/lib/db.ts)                │                   │
│  │                                      │                   │
│  │  Singleton pattern to survive        │                   │
│  │  Next.js HMR in development.        │                   │
│  └──────────────┬───────────────────────┘                   │
│                 │                                           │
│                 ▼                                           │
│          ┌──────────────┐                                   │
│          │  SQLite      │                                   │
│          │  (dev.db)    │                                   │
│          └──────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

### Pattern: Server-First, Client-Interactive

Most pages follow this pattern:
1. **Server component** (`page.tsx`) fetches data via server actions or direct Prisma calls
2. Data is serialized (dates → ISO strings) and passed as props
3. **Client component** renders interactive UI with `useTransition` for mutations
4. After mutation, `router.refresh()` triggers server re-render with fresh data

### Why This Pattern?

- Initial page load is fast (server-rendered with data)
- No loading spinners for first paint
- Mutations are type-safe server actions (no REST API boilerplate)
- `router.refresh()` re-runs server components without full page reload

---

## 6. Page-by-Page Breakdown

### Dashboard (`/` → `src/app/page.tsx`)

**Type**: Server Component  
**Data**: `getDashboardData()` — the most complex action, aggregates ~15 database queries

**Widgets** (all in `src/components/dashboard/`):

| Widget | Component | Description |
|--------|-----------|-------------|
| Stats Row | `StatsCards.tsx` | 8 metric cards (streak, readiness, projected date, study hours, etc.) |
| Today's Mission | `TodaysMission.tsx` | 4 daily targets with mini progress bars |
| Overall Progress | `ProgressSummary.tsx` | Videos/Problems/Patterns with percentage bars |
| Revision Queue | `RevisionQueue.tsx` | Due revisions with complete/skip buttons (client) |
| Activity Heatmap | `GitHubHeatmap.tsx` | 365-day GitHub-style contribution grid (client) |
| Pattern Readiness | `PatternReadiness.tsx` | 15 horizontal bars showing per-pattern completion |

---

### Patterns (`/patterns` → `src/app/patterns/page.tsx`)

**Type**: Server Component  
**Data**: `getPatterns()` with included videos and problems

Renders a responsive grid of 15 pattern cards. Each card shows:
- Pattern number and name
- Video count (watched/total)
- Problem count (solved/total)
- Completion bar with gradient color
- Border color changes based on status (green = completed, blue = in progress)

---

### Pattern Detail (`/patterns/[id]` → `src/app/patterns/[id]/page.tsx`)

**Type**: Server → Client hybrid  
**Server**: Fetches pattern with all videos, problems, and notes. Serializes dates.  
**Client**: `PatternDetailClient.tsx` — tabbed interface

**3 Tabs**:
1. **Videos** — List of videos with watched/unwatched toggle (checkbox). Watched videos get green background and strikethrough.
2. **Problems** — List with dropdown status selector, difficulty badges, mastery %, and external link to LeetCode/GFG. Changing status to "Solved" auto-creates revision schedule.
3. **Notes** — Three text areas (Key Learnings, Common Mistakes, Revision Notes) with save button. Stored in `PatternNote` model.

---

### Problems (`/problems` → `src/app/problems/page.tsx`)

**Type**: Client Component (fetches data on mount and filter change)  
**Data**: `getProblems(filters)` + `getPatterns()` for filter dropdown

**Features**:
- Search bar (filters by title, client-side)
- 3 dropdown filters: Pattern, Status, Difficulty
- Table with columns: Status (dropdown), Title, Pattern, Difficulty, Platform, Mastery (bar), Link
- Header shows solved/total/remaining counts

---

### Videos (`/videos` → `src/app/videos/page.tsx`)

**Type**: Client Component  
**Data**: `getVideos()` with included pattern

**Features**:
- Overall progress bar (X/114 watched, Y%)
- Search bar
- Toggle filter: All / Unwatched / Watched
- Videos grouped by pattern with section headers
- Click circle to toggle watched status

---

### Revisions (`/revisions` → `src/app/revisions/page.tsx`)

**Type**: Server → Client hybrid  
**Server**: Fetches today's due, upcoming 7 days, and recent history  
**Client**: `RevisionClient.tsx` with complete/skip actions

**3 Sections**:
1. **Due Today** — Amber-highlighted cards with "Done" and "Skip" buttons + link to problem
2. **Upcoming 7 Days** — Preview of what's coming
3. **Recent History** — Last 20 completed/skipped revisions

---

### Analytics (`/analytics` → `src/app/analytics/page.tsx`)

**Type**: Server → Client hybrid  
**Server**: `getAnalyticsData()` aggregates study sessions and daily logs  
**Client**: `AnalyticsClient.tsx` renders Recharts charts

**Visualizations**:
- 4 stat cards (total time, avg/day, best day, top pattern)
- Weekly study hours bar chart
- Mission score trend line chart
- Time-by-pattern horizontal bar breakdown

---

### Journal (`/journal` → `src/app/journal/page.tsx`)

**Type**: Client Component  
**Data**: Fetches via `/api/journal?date=YYYY-MM-DD` API route

**Features**:
- Date navigation (prev/next day arrows)
- Large textarea for journal entry
- Save button with confirmation
- Writing prompts (clickable, appends to textarea)
- Character counter

---

### Goals (`/goals` → `src/app/goals/page.tsx`)

**Type**: Client Component  
**Data**: `getSettings()` + `getDashboardData()`

**Features**:
- Current pace display (problems/day based on 30-day average)
- Projected completion date
- Remaining problems count
- Target date input → calculates required daily pace
- Green/red "On Track" / "Behind Schedule" indicator
- Daily target settings (videos, problems, study minutes)

---

### Admin (`/admin` → `src/app/admin/page.tsx`)

**Type**: Client Component  
**Data**: `getPatterns()` for dropdowns

**3 Forms** (tab-switched):
1. Add Pattern — name + description
2. Add Video — episode #, title, pattern, duration
3. Add Problem — title, URL, pattern, difficulty, platform, sub-pattern

This is how new content gets added when the YouTube playlist grows or new problems are discovered.

---

## 7. Core Business Logic

### Completion Formula

```
Pattern Completion = (video_progress × 40) + (problem_progress × 60)

video_progress  = watched_videos / total_videos     (0.0 to 1.0)
problem_progress = solved_problems / total_problems  (0.0 to 1.0)
```

Problems are weighted higher because solving > watching.

### Mastery System

```
Level 0: Not solved      → Mastery = 0%
Level 1: Solved           → Mastery = 20%
Level 2: Revision 1 done  → Mastery = 40%
Level 3: Revision 2 done  → Mastery = 60%
Level 4: Revision 3 done  → Mastery = 80%
Level 5: Revision 4 done  → Mastery = 100% (MASTERED)
```

### Spaced Repetition Schedule

When a problem is marked "Solved", a revision is automatically created:

| Revision # | Days After Solving | Cumulative Days |
|------------|-------------------|-----------------|
| 1 | 3 | 3 |
| 2 | 7 | 10 |
| 3 | 14 | 24 |
| 4 | 30 | 54 |
| 5 | 60 | 114 |

Completing a revision auto-creates the next one. Skipping doesn't.

### Mission Score

```
Daily Mission Score = video_score + problem_score + study_score

video_score   = min(completed_videos / target_videos, 1.0) × 33.33
problem_score = min(completed_problems / target_problems, 1.0) × 33.33
study_score   = min(completed_study_mins / target_study_mins, 1.0) × 33.34

Total = 0–100
```

### Streak Logic

A day counts as a "study day" if:
- `completedProblems >= 1` OR `completedStudyMins >= 30`

Current streak = consecutive study days counting back from today.

### Placement Readiness

```
Overall Readiness = average of all pattern completion percentages
```

### Projected Completion Date

```
problems_per_day = problems_solved_in_last_30_days / 30
remaining = total_problems - solved_problems
estimated_days = remaining / problems_per_day
projected_date = today + estimated_days
```

---

## 8. Design System

All design tokens are in `src/app/globals.css` under the `@theme {}` block.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#0a0a0f` | Page background |
| `--color-bg-secondary` | `#111118` | Sidebar background |
| `--color-bg-card` | `#16161f` | Card backgrounds |
| `--color-bg-card-hover` | `#1c1c28` | Card hover state |
| `--color-bg-elevated` | `#1e1e2a` | Elevated surfaces |
| `--color-border` | `#2a2a3a` | Primary borders |
| `--color-border-subtle` | `#1e1e2e` | Subtle dividers |
| `--color-accent-blue` | `#3b82f6` | Primary accent, links, active states |
| `--color-accent-emerald` | `#10b981` | Success, completed, solved |
| `--color-accent-amber` | `#f59e0b` | Warning, streaks, revisions |
| `--color-accent-red` | `#ef4444` | Error, behind schedule |
| `--color-accent-purple` | `#a855f7` | Videos, creative elements |
| `--color-text-primary` | `#f0f0f5` | Primary text |
| `--color-text-secondary` | `#9ca3af` | Secondary text |
| `--color-text-muted` | `#6b7280` | Muted text, labels |

Each accent color has a matching `-dim` variant for backgrounds (e.g., `--color-accent-blue-dim: #1e3a5f`).

### Typography

- **Sans**: Inter (Google Fonts) — all UI text
- **Mono**: JetBrains Mono — numbers, stats, code

### Key CSS Classes

- `.card-glow` — Adds a blue gradient top-border glow on hover
- `.progress-bar-fill` — Animated width transition (0.8s cubic-bezier)
- `.nav-active` — Sidebar active indicator (blue left border)
- `.heatmap-cell` — Hover scale effect for heatmap squares
- `.stat-value` — Fade-up entrance animation
- `.pulse-dot` — Pulsing opacity animation for live indicators

---

## 9. File Tree Reference

```
c:\project\RoadmapHQ\
├── prisma\
│   ├── schema.prisma                    # Database schema (8 models)
│   ├── seed.ts                          # Seed script (run via npm run db:seed)
│   ├── dev.db                           # SQLite database file (gitignored)
│   └── seed-data\
│       ├── patterns.ts                  # 15 pattern definitions
│       ├── problems.ts                  # 171 problems with URLs
│       └── videos.ts                    # 114 video entries
├── src\
│   ├── app\
│   │   ├── globals.css                  # Design system (colors, fonts, animations)
│   │   ├── layout.tsx                   # Root layout (sidebar + main content)
│   │   ├── page.tsx                     # Dashboard (home page)
│   │   ├── admin\page.tsx               # Admin: add patterns/videos/problems
│   │   ├── analytics\page.tsx           # Analytics: study charts
│   │   ├── api\journal\route.ts         # API: GET journal entries by date
│   │   ├── goals\page.tsx               # Goals: targets + projections
│   │   ├── journal\page.tsx             # Journal: daily entries
│   │   ├── patterns\
│   │   │   ├── page.tsx                 # Patterns grid overview
│   │   │   └── [id]\page.tsx            # Pattern detail (server)
│   │   ├── problems\page.tsx            # Problems table with filters
│   │   ├── revisions\page.tsx           # Revision center (server)
│   │   └── videos\page.tsx              # Playlist tracker
│   ├── components\
│   │   ├── layout\
│   │   │   └── Sidebar.tsx              # Navigation sidebar
│   │   ├── dashboard\
│   │   │   ├── StatsCards.tsx            # 8 metric cards
│   │   │   ├── TodaysMission.tsx        # Daily mission checklist
│   │   │   ├── ProgressSummary.tsx      # Videos/Problems/Patterns bars
│   │   │   ├── RevisionQueue.tsx        # Due revisions widget
│   │   │   ├── GitHubHeatmap.tsx        # 365-day activity grid
│   │   │   └── PatternReadiness.tsx     # Per-pattern completion bars
│   │   ├── patterns\
│   │   │   └── PatternDetailClient.tsx  # Tabbed pattern detail (client)
│   │   ├── revisions\
│   │   │   └── RevisionClient.tsx       # Revision actions (client)
│   │   └── analytics\
│   │       └── AnalyticsClient.tsx      # Recharts charts (client)
│   └── lib\
│       ├── db.ts                        # Prisma client singleton
│       ├── actions.ts                   # ALL server actions (~400 lines)
│       └── utils.ts                     # Utility functions
├── docs\
│   ├── PROJECT_GUIDE.md                 # THIS FILE
│   └── reference\
│       ├── Sheet - DSA Patterns 2025.pdf
│       └── youtube playlist.pdf
├── package.json                         # Project config + scripts
├── README.md                            # User-facing readme
├── CONTRIBUTING.md                      # Architecture + commit guide
├── read_pdfs.py                         # PDF extraction script (historical)
└── .gitignore                           # Ignores node_modules, dev.db, etc.
```

---

## 10. How to Add Content

### When New Videos Are Added to the Playlist

**Option A: Via Admin UI**
1. Go to `/admin` → "Add Video" tab
2. Enter episode number, title, select pattern, add duration
3. Click "Add Video"

**Option B: Via Seed Data**
1. Add entries to `prisma/seed-data/videos.ts`
2. Run `npm run db:seed` (the seed script is idempotent — checks `episodeNumber` before inserting)

### When New Problems Are Discovered

Same two options. For seed data, add to `prisma/seed-data/problems.ts` with all fields.
The seed script checks `url + patternId` uniqueness.

### When New Patterns Are Needed

Add via Admin UI or add to `prisma/seed-data/patterns.ts` and re-seed.
The seed script uses `upsert` on pattern name.

---

## 11. Known Limitations & Quirks

### Current Limitations

1. **No live study timer on dashboard** — `startStudySession()` and `endStudySession()` server actions exist but no UI component to drive them yet. Planned for Phase 2.

2. **No YouTube API integration** — New videos must be added manually. The playlist JSON could be auto-fetched with YouTube Data API v3.

3. **No LeetCode API** — Problem status isn't synced with LeetCode. Must be marked manually.

4. **Video URLs are nullable and seeded empty.** The `Video.url` field was added in v0.2.0 so existing 114 seed rows have `url = NULL`. The UI falls back to a YouTube search-by-title button ("Find") and lets you paste a URL inline on `/videos` — that URL is persisted via `updateVideoUrl()`.

### Resolved in v0.2.0

These were called out in v0.1.0 and are now fixed:

- ✅ Pattern status auto-flips between `NOT_STARTED` / `IN_PROGRESS` / `COMPLETED` via `maybeCompletePattern()` after any video/problem write.
- ✅ Mobile layout — `AppShell.tsx` renders a hamburger drawer below `md` and the desktop sidebar above it.
- ✅ DailyLog duplicate-day risk — `updateTodayLog` now uses `prisma.dailyLog.upsert({ where: { date: today } })`.
- ✅ The phantom "unused `import { prisma }` in `src/app/journal/page.tsx`" never actually existed; the doc was wrong.
- ✅ Dashboard "Revise" mission counter was hardcoded `0`; now reads `todayRevisionsCompleted` from `getDashboardData`.
- ✅ Heatmap intensity now reflects `completedProblems` alone — no longer mixes in the `studyMins >= 30 ? 1 : 0` ghost increment.

### Prisma 6 Deprecation Warning

Every Prisma command shows:
```
warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7.
```
This is harmless. When upgrading to Prisma 7, move the seed config to `prisma.config.ts`.

### TailwindCSS v4 + @theme

TailwindCSS v4 uses the new `@theme {}` directive in CSS. This replaces `tailwind.config.ts` for design tokens. If you need to add new design tokens, add them inside `@theme {}` in `globals.css`, NOT in a config file.

---

## 12. Future Roadmap

### Phase 2: Study Timer & Polish

- [ ] Live study timer component on dashboard (start/pause/stop)
- [ ] Timer associates with selected pattern
- [ ] Auto-save session when timer stops
- [ ] Mobile responsive layout (collapsible sidebar)
- [ ] Auto-update pattern status when fully completed
- [ ] Dark/light theme toggle (currently dark-only)
- [ ] Keyboard shortcuts (n = next video, s = start timer)

### Phase 3: API Integrations

- [ ] YouTube Data API v3 — auto-sync playlist, detect new videos
- [ ] LeetCode GraphQL API — auto-sync solved problems
- [ ] Show problem descriptions inline (via API)
- [ ] Auto-detect video durations

### Phase 4: Intelligence

- [ ] AI study coach — suggest what to study based on weak patterns
- [ ] Pattern recommendation — "you should focus on X next"
- [ ] Difficulty auto-prediction based on solve time
- [ ] Optimal study schedule generator
- [ ] Weekly email digest with progress summary

### Phase 5: Scale

- [ ] Multiple roadmap support (DSA, System Design, etc.)
- [ ] Company-specific prep tracks (Amazon, Google, etc.)
- [ ] Interview readiness score (weighted by company's favorite patterns)
- [ ] Community features (if ever made public)
- [ ] Export progress to PDF/JSON

---

## 13. Git Commit Strategy

For pushing to GitHub **stepwise** (to look like genuine incremental work):

```
1. feat: initialize next.js project with typescript and tailwindcss
   → package.json, next.config.ts, tsconfig.json, .gitignore

2. feat: add prisma schema with sqlite database models
   → prisma/schema.prisma

3. feat: add seed data for 15 patterns, 114 videos, and 171 problems
   → prisma/seed-data/*, prisma/seed.ts

4. feat: add core library - database client, utilities, server actions
   → src/lib/db.ts, src/lib/utils.ts, src/lib/actions.ts

5. feat: build main dashboard with stats, mission, and heatmap
   → src/app/page.tsx, src/app/layout.tsx, src/app/globals.css
   → src/components/layout/Sidebar.tsx
   → src/components/dashboard/*

6. feat: add pattern overview and detail pages
   → src/app/patterns/*, src/components/patterns/*

7. feat: add problems page with filters and status tracking
   → src/app/problems/page.tsx

8. feat: add videos playlist page with watch progress
   → src/app/videos/page.tsx

9. feat: add revision center with spaced repetition
   → src/app/revisions/*, src/components/revisions/*

10. feat: add analytics, journal, goals, and admin pages
    → src/app/analytics/*, src/app/journal/*, src/app/goals/*, src/app/admin/*
    → src/components/analytics/*, src/app/api/journal/*

11. docs: add readme, contributing guide, and project documentation
    → README.md, CONTRIBUTING.md, docs/PROJECT_GUIDE.md
```

---

## 14. Quick Reference for AI Agents

If you're an AI agent picking up this project, here's what you need to know fast:

### To run the project
```bash
npm install
npm run setup    # generates Prisma client + pushes schema + seeds data
npm run dev      # starts at localhost:3000
```

### Daily launch (Windows)
Double-click `dev.bat` in the project root — it starts `npm run dev` and opens the dashboard in your default browser. To pin to the desktop:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\create-desktop-shortcut.ps1
```
Alternatively, install as a PWA: open the app in Chrome/Edge → install icon in the address bar. The manifest is at `public/manifest.webmanifest`; the service worker (production-only) at `public/sw.js`.

### To add a new page
1. Create `src/app/<route>/page.tsx`
2. If interactive, create a client component in `src/components/<feature>/`
3. Add server actions in `src/lib/actions.ts`
4. Add nav link in `src/components/layout/Sidebar.tsx`

### To modify the database
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (for dev) or `npx prisma migrate dev` (for production)
3. Update seed data if needed
4. Update server actions in `src/lib/actions.ts`

### To add a new design token
Add it inside `@theme {}` in `src/app/globals.css`

### Key files to understand
1. `prisma/schema.prisma` — data model (read first)
2. `src/lib/actions.ts` — all backend logic (read second)
3. `src/app/page.tsx` — dashboard layout (read third)
4. `src/app/globals.css` — design system (reference)

### Common patterns in this codebase
- Server components fetch data, client components handle interactions
- `useTransition` + `router.refresh()` for optimistic-feeling mutations
- All dates serialized to ISO strings when crossing server → client boundary
- Status fields use string enums (not TypeScript enums) for Prisma compatibility
- Every page has `export const dynamic = "force-dynamic"` for server components (ensures fresh data)

---

*Last updated: June 5, 2026 (v0.2.0 — Phase 1 polish)*
*Author: Prakash (prakash-nitc) + AI Assistant*
