# DSA Mission Control 🚀

> A personal DSA preparation operating system — track progress, stay consistent, become placement ready.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

## What is this?

DSA Mission Control is a personal web app designed to act as a complete preparation operating system for mastering Data Structures and Algorithms. It combines:

- **YouTube Playlist Tracking** — 114 videos from "DSA Patterns 2025 · Padho with Pratyush"
- **Problem Sheet Tracking** — 171 problems organized by 15 DSA patterns
- **Spaced Repetition Revision** — Automatic revision scheduling at 3, 7, 14, 30, 60 day intervals
- **Study Session Timer** — Track study hours with pattern association
- **GitHub-style Heatmap** — 365-day activity visualization
- **Daily Mission System** — Daily targets for videos, problems, and study time
- **Streak System** — Current streak, longest streak, total study days
- **Projection Engine** — Estimated completion date based on current pace
- **Goal Setting** — Set target dates and see required daily pace
- **Mastery Scoring** — 0-100 mastery per problem based on revisions

## Tech Stack

| Layer     | Technology           |
|-----------|---------------------|
| Framework | Next.js 15 (App Router) |
| Language  | TypeScript           |
| Styling   | TailwindCSS v4       |
| Database  | SQLite (via Prisma)  |
| ORM       | Prisma 6             |
| Charts    | Recharts             |
| Icons     | Lucide React         |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/prakash-nitc/RoadmapHQ.git
cd RoadmapHQ

# Install dependencies
npm install

# Setup database (generate client, push schema, seed data)
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Mission Control.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup` | One-command database setup |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with DSA data |
| `npm run db:studio` | Open Prisma Studio (visual DB editor) |
| `npm run db:reset` | Reset and reseed database |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main Dashboard — mission control command center |
| `/patterns` | All 15 DSA patterns with progress |
| `/patterns/[id]` | Pattern detail — videos, problems, notes |
| `/problems` | All 171 problems with filters |
| `/videos` | Full 114-video playlist |
| `/revisions` | Spaced repetition revision center |
| `/analytics` | Study analytics and charts |
| `/journal` | Daily learning journal |
| `/goals` | Goal setting and projection engine |
| `/admin` | Add new patterns, videos, problems |

## Database Schema

The app uses 8 models:

- **Pattern** — 15 DSA patterns (Two Pointers, Trees, DP, etc.)
- **Video** — YouTube playlist videos mapped to patterns
- **Problem** — Practice problems with status, mastery, difficulty
- **Revision** — Spaced repetition schedule per problem
- **StudySession** — Timer-tracked study sessions
- **DailyLog** — Daily progress, mission scores, journal entries
- **PatternNote** — Key learnings, mistakes, revision notes per pattern
- **UserSettings** — Target dates and daily goals

## Problem Status Flow

```
NOT_STARTED → ATTEMPTED → SOLVED → REVISED → MASTERED
                                      ↑
                              (via revision system)
```

## Mastery System

Each revision increases mastery by 20%:

| Level | Action | Mastery |
|-------|--------|---------|
| 0 | Not solved | 0% |
| 1 | Solved | 20% |
| 2 | Revision 1 (3 days) | 40% |
| 3 | Revision 2 (7 days) | 60% |
| 4 | Revision 3 (14 days) | 80% |
| 5 | Revision 4 (30 days) | 100% |

## Completion Formula

Pattern completion = 40% (video progress) + 60% (problem progress)

## Future Plans

- [ ] LeetCode API integration
- [ ] Automatic playlist sync
- [ ] AI study coach
- [ ] Multiple roadmap support
- [ ] Interview readiness score

## License

Private project.
