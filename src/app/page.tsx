import { format } from "date-fns";
import { getDashboardData } from "@/lib/actions";
import { MissionBriefing } from "@/components/dashboard/MissionBriefing";
import { DailyMission } from "@/components/dashboard/DailyMission";
import { RevisionQueue } from "@/components/dashboard/RevisionQueue";
import { MonthlyStreakCalendar } from "@/components/dashboard/MonthlyStreakCalendar";
import { PatternReadiness } from "@/components/dashboard/PatternReadiness";
import { StreakWarning } from "@/components/dashboard/StreakWarning";
import { MissedDayCard } from "@/components/dashboard/MissedDayCard";
import { ComebackCard } from "@/components/dashboard/ComebackCard";
import { TomorrowPreview } from "@/components/dashboard/TomorrowPreview";
import { DailyCelebration } from "@/components/dashboard/DailyCelebration";
import { WeeklyReviewBanner } from "@/components/dashboard/WeeklyReviewBanner";
import { PlacementCountdown } from "@/components/dashboard/PlacementCountdown";
import { RevisionDueNudge } from "@/components/dashboard/RevisionDueNudge";

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
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Confetti / quote toast — one-shot per day, fires on full completion */}
      <DailyCelebration missionComplete={data.missionComplete} />

      {/* Sunday-only review banner — dismissible per week */}
      <WeeklyReviewBanner />

      {/* Placement countdown — always visible, color tier escalates as days drop */}
      <PlacementCountdown
        {...data.placementCountdown}
        problemsPerDay={data.problemsPerDay}
        targetPerDay={data.targetPerDay}
      />

      {/* Daily revision nudge — clear the recall queue first */}
      <RevisionDueNudge />

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

      {/* Today's mission + Revision engine | compact study calendar.
          Calendar lives in the right rail like a widget, not a full panel. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          <div className="section-card">
            <DailyMission
              nextVideo={data.nextVideo}
              todayLog={data.todayLog}
              revisionsDue={data.todayRevisions.length}
              revisionsDone={data.todayRevisionsCompleted}
              embedded
            />
          </div>
          <RevisionQueue revisions={data.todayRevisions} />
        </div>

        <div className="lg:col-span-1">
          <MonthlyStreakCalendar
            data={data.heatmapData}
            startDateISO={data.startDateISO}
            currentStreak={data.currentStreak}
            longestStreak={data.longestStreak}
          />
        </div>
      </div>

      <PatternReadiness patterns={data.patternReadiness} />
    </div>
  );
}
