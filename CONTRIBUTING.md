# Contributing to DSA Mission Control

## Architecture Overview

```
RoadmapHQ/
├── prisma/
│   ├── schema.prisma          # Database schema (8 models)
│   ├── seed.ts                # Seeds 15 patterns, 114 videos, 171 problems
│   ├── dev.db                 # SQLite database (auto-generated)
│   └── seed-data/             # Extracted from the DSA course PDFs
│       ├── patterns.ts        # 15 pattern definitions
│       ├── problems.ts        # 171 problems with URLs
│       └── videos.ts          # 114 video titles with durations
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard (server component)
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   ├── globals.css        # Design system + CSS vars
│   │   ├── patterns/          # Pattern overview + detail pages
│   │   ├── problems/          # Filterable problems table
│   │   ├── videos/            # Playlist progress tracker
│   │   ├── revisions/         # Spaced repetition center
│   │   ├── analytics/         # Charts and study analytics
│   │   ├── journal/           # Daily learning journal
│   │   ├── goals/             # Goal setting + projections
│   │   ├── admin/             # Content management
│   │   └── api/journal/       # Journal entry API
│   ├── components/
│   │   ├── layout/Sidebar.tsx         # Navigation sidebar
│   │   ├── dashboard/                 # Dashboard widgets
│   │   │   ├── StatsCards.tsx         # Key metrics grid
│   │   │   ├── TodaysMission.tsx      # Daily mission checklist
│   │   │   ├── ProgressSummary.tsx    # Videos/Problems/Patterns bars
│   │   │   ├── RevisionQueue.tsx      # Due revisions widget
│   │   │   ├── GitHubHeatmap.tsx      # 365-day activity heatmap
│   │   │   └── PatternReadiness.tsx   # Per-pattern completion bars
│   │   ├── patterns/                  # Pattern detail components
│   │   │   └── PatternDetailClient.tsx
│   │   ├── revisions/                 # Revision center UI
│   │   │   └── RevisionClient.tsx
│   │   └── analytics/                 # Analytics charts
│   │       └── AnalyticsClient.tsx
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── actions.ts         # All server actions (backend logic)
│       └── utils.ts           # Utility functions
└── docs/reference/            # Original PDF sources
```

## Key Concepts

### Server Actions vs Client Components
- **Server Components**: Pages that fetch data (Dashboard, Patterns, Revisions, Analytics)
- **Client Components**: Interactive UIs with `"use client"` (Problem table, Video toggles, Forms)
- **Server Actions**: Database mutations in `src/lib/actions.ts` — called from both server and client

### Data Flow
```
User Action → Server Action → Prisma → SQLite → Revalidate → UI Update
```

### Design System
All colors use CSS custom properties in `globals.css` under `@theme {}`:
- `--color-bg-*` — Background layers
- `--color-accent-*` — Brand colors (blue, emerald, amber, red, purple)
- `--color-text-*` — Text hierarchy (primary, secondary, muted)
- `--color-heatmap-*` — GitHub-style green scale

### Pattern Completion Formula
```
Completion = (video_progress * 0.4 + problem_progress * 0.6) * 100
```

### Revision Schedule
When a problem is marked "Solved", automatic revision entries are created:
- Revision 1: 3 days after solving
- Revision 2: 7 days after solving
- Revision 3: 14 days after solving
- Revision 4: 30 days after solving
- Revision 5: 60 days after solving

Each revision bumps mastery by +20 (max 100).

### Streak Logic
A "study day" requires either:
- Solving ≥1 problem, OR
- Studying ≥30 minutes

## Adding New Content

### Via Admin UI
Navigate to `/admin` and use the forms to add patterns, videos, or problems.

### Via Seed Data
1. Add entries to `prisma/seed-data/problems.ts` or `videos.ts`
2. Run `npm run db:seed` (idempotent — won't create duplicates)

## Common Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000

# Database
npm run db:studio        # Visual database editor
npm run db:reset         # Reset + reseed (for debugging)
npm run db:seed          # Re-seed without reset

# Build
npm run build            # Production build
npm run start            # Start production server
```

## Git Commit Strategy

For pushing to GitHub stepwise:

1. `feat: Initialize Next.js project with TypeScript and TailwindCSS`
2. `feat: Add Prisma schema with SQLite database models`
3. `feat: Add seed data - 15 patterns, 114 videos, 171 problems`
4. `feat: Build main dashboard with stats, mission, and heatmap`
5. `feat: Add pattern overview and detail pages`
6. `feat: Add problems page with filters and status tracking`
7. `feat: Add videos playlist page with watch progress`
8. `feat: Add revision center with spaced repetition`
9. `feat: Add analytics page with Recharts`
10. `feat: Add journal, goals, and admin pages`
11. `docs: Add README and contributing guide`

## Future Development

### Phase 2
- LeetCode API integration for auto-sync
- YouTube Data API for playlist updates
- Pattern recommendation engine

### Phase 3
- Multiple roadmap support
- Company-specific prep tracks
- Interview readiness scoring
- AI-powered study coach
