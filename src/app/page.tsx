import { format } from "date-fns";
import { getDashboardData } from "@/lib/actions";
import { MissionBriefing } from "@/components/dashboard/MissionBriefing";
import { DailyMission } from "@/components/dashboard/DailyMission";
import { RevisionQueue } from "@/components/dashboard/RevisionQueue";
import { GitHubHeatmap } from "@/components/dashboard/GitHubHeatmap";
import { PatternReadiness } from "@/components/dashboard/PatternReadiness";
import { StreakWarning } from "@/components/dashboard/StreakWarning";
import { MissedDayCard } from "@/components/dashboard/MissedDayCard";
import { ComebackCard } from "@/components/dashboard/ComebackCard";
import { TomorrowPreview } from "@/components/dashboard/TomorrowPreview";
import { DailyCelebration } from "@/components/dashboard/DailyCelebration";
import { WeeklyReviewBanner } from "@/components/dashboard/WeeklyReviewBanner";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Confetti / quote toast — one-shot per day, fires on full completion */}
      <DailyCelebration missionComplete={data.missionComplete} />

      {/* Sunday-only review banner — dismissible per week */}
      <WeeklyReviewBanner />

      {/* Comeback flow takes priority if you've been away */}
      <ComebackCard
        daysSinceLastStudy={data.daysSinceLastStudy}
        currentStreak={data.currentStreak}
        longestStreak={data.longestStreak}
        lastStudyDayISO={data.lastStudyDayISO}
      />

      {/* Missed-yesterday nudge (only when not on a streak) */}
      <MissedDayCard
        daysSinceLastStudy={data.daysSinceLastStudy}
        lastStudyDayISO={data.lastStudyDayISO}
        currentStreak={data.currentStreak}
        problemsPerDay={data.problemsPerDay}
        targetProblems={data.todayLog?.targetProblems ?? 3}
      />

      {/* Late-day streak warning — appears 8pm+ if not done */}
      <StreakWarning
        currentStreak={data.currentStreak}
        missionComplete={data.missionComplete}
      />

      {/* Tomorrow preview — surfaces when today is fully done */}
      {data.missionComplete && (
        <TomorrowPreview
          pattern={data.tomorrowPattern}
          nextVideo={data.tomorrowNextVideo}
          unsolvedCount={data.tomorrowUnsolvedCount}
        />
      )}

      {/* Hero */}
      <MissionBriefing
        greeting={getGreeting()}
        dayNumber={data.dayNumber}
        todayDate={format(new Date(), "EEE, MMM d")}
        solvedProblems={data.solvedProblems}
        totalProblems={data.totalProblems}
        watchedVideos={data.watchedVideos}
        totalVideos={data.totalVideos}
        overallReadiness={data.overallReadiness}
        currentStreak={data.currentStreak}
        longestStreak={data.longestStreak}
        projectedDate={data.projectedDate}
        problemsPerDay={data.problemsPerDay}
        targetDate={data.targetDate}
      />

      {/* Combined Today's mission + Study activity card | Revision engine.
          items-stretch so the right card matches the (taller) left card height. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 section-card flex flex-col">
          <DailyMission
            nextVideo={data.nextVideo}
            todayLog={data.todayLog}
            revisionsDue={data.todayRevisions.length}
            revisionsDone={data.todayRevisionsCompleted}
            embedded
          />
          <div className="h-px bg-[var(--color-border-subtle)] mx-5" />
          <GitHubHeatmap data={data.heatmapData} embedded />
        </div>

        <div className="lg:col-span-1 flex">
          <RevisionQueue revisions={data.todayRevisions} />
        </div>
      </div>

      <PatternReadiness patterns={data.patternReadiness} />
    </div>
  );
}
