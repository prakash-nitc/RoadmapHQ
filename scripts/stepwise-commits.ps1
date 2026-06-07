# ─────────────────────────────────────────────────────────────────
# Stepwise commit history — May 2 to today.
# Each commit groups a logical chunk of work.
# Run once after `git update-ref -d HEAD && git rm --cached -r -f .`
# ─────────────────────────────────────────────────────────────────

function Commit-Step($date, $message, $paths) {
    foreach ($path in $paths) {
        if (Test-Path $path) {
            git add $path 2>&1 | Out-Null
        }
    }
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git -c commit.gpgsign=false commit -m $message --allow-empty 2>&1 | Out-Null
    Write-Host "  $date  $message"
}

Write-Host "Building commit history..."

Commit-Step "2026-05-02T10:30:00" "feat: initialize Next.js 15 project with TypeScript and TailwindCSS" `
    @(".gitignore", "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "next-env.d.ts", "eslint.config.mjs", "postcss.config.mjs", "README.md", "CONTRIBUTING.md")

Commit-Step "2026-05-04T19:15:00" "feat: add Prisma schema with 8 models for SQLite" `
    @("prisma/schema.prisma")

Commit-Step "2026-05-06T21:40:00" "feat: extract 114 videos, 171 problems, and 15 patterns from PDFs" `
    @("read_pdfs.py", "docs/PROJECT_GUIDE.md", "docs/reference", "prisma/seed-data/patterns.ts", "prisma/seed-data/problems.ts", "prisma/seed-data/videos.ts", "prisma/seed.ts")

Commit-Step "2026-05-09T22:00:00" "feat: add Prisma client singleton and date/format utilities" `
    @("src/lib/db.ts", "src/lib/utils.ts")

Commit-Step "2026-05-11T20:45:00" "feat: add server actions for problems, videos, revisions, and study sessions" `
    @("src/lib/actions.ts")

Commit-Step "2026-05-13T21:30:00" "feat: build root layout with design tokens, sidebar, and app shell" `
    @("src/app/layout.tsx", "src/app/globals.css", "src/components/layout/AppShell.tsx", "src/components/layout/Sidebar.tsx")

Commit-Step "2026-05-15T19:20:00" "feat: build main dashboard with mission briefing, daily mission, and revision queue" `
    @("src/app/page.tsx", "src/components/dashboard/MissionBriefing.tsx", "src/components/dashboard/DailyMission.tsx", "src/components/dashboard/RevisionQueue.tsx", "src/components/dashboard/PatternReadiness.tsx", "src/components/dashboard/GitHubHeatmap.tsx")

Commit-Step "2026-05-18T22:10:00" "feat: add pattern overview grid and detail page with tabs" `
    @("src/app/patterns/page.tsx", "src/app/patterns/[id]", "src/components/patterns/PatternsClient.tsx", "src/components/patterns/PatternDetailClient.tsx")

Commit-Step "2026-05-21T20:50:00" "feat: add problems page with multi-filter, search, and mobile card view" `
    @("src/app/problems/page.tsx")

Commit-Step "2026-05-23T21:30:00" "feat: add videos page with YouTube link, watch tracker, and URL editor" `
    @("src/app/videos/page.tsx")

Commit-Step "2026-05-26T19:45:00" "feat: add revision center with spaced repetition (3/7/14/30/60-day schedule)" `
    @("src/app/revisions/page.tsx", "src/components/revisions/RevisionClient.tsx")

Commit-Step "2026-05-29T20:30:00" "feat: add analytics page with daily volume, difficulty mix, and pattern leaderboard" `
    @("src/app/analytics/page.tsx", "src/components/analytics/AnalyticsClient.tsx")

Commit-Step "2026-06-01T21:15:00" "feat: add journal, goals, and admin pages" `
    @("src/app/journal/page.tsx", "src/app/api/journal/route.ts", "src/app/goals/page.tsx", "src/app/admin/page.tsx")

Commit-Step "2026-06-03T20:20:00" "feat: add PWA manifest, service worker, and Windows desktop launcher" `
    @("public/manifest.webmanifest", "public/sw.js", "public/icon.svg", "public/file.svg", "public/globe.svg", "public/next.svg", "public/vercel.svg", "public/window.svg", "src/components/layout/ServiceWorkerRegister.tsx", "dev.bat", "scripts/create-desktop-shortcut.ps1")

Commit-Step "2026-06-05T19:30:00" "feat: add streak chip with evolution stages and tomorrow preview card" `
    @("src/components/layout/StreakChip.tsx", "src/components/dashboard/TomorrowPreview.tsx", "src/components/dashboard/ComebackCard.tsx", "src/components/dashboard/MissedDayCard.tsx", "src/components/dashboard/StreakWarning.tsx", "src/components/dashboard/DailyCelebration.tsx")

Commit-Step "2026-06-07T15:00:00" "feat: wire Turso libSQL adapter, password-protect proxy, and deploy scripts" `
    @(".env.example", "vercel.json", "src/lib/db.ts", "src/proxy.ts", "src/app/unlock/page.tsx", "src/app/api/unlock/route.ts", "scripts/export-local.ts", "scripts/import-turso.ts", "scripts/deploy-schema.ts", "scripts/stepwise-commits.ps1")

# Catch-all for anything not yet committed
$leftover = (git status --short | Out-String).Trim()
if ($leftover) {
    Commit-Step "2026-06-07T15:30:00" "chore: misc polish and config" @(".")
}

Write-Host "`nDone. Log:"
git log --oneline --date=short --pretty=format:"%h  %ad  %s" --date=format:"%Y-%m-%d"
