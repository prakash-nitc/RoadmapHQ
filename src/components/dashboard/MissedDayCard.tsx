import { CloudRain, RotateCcw } from "lucide-react";

interface MissedDayCardProps {
  daysSinceLastStudy: number | null;
  lastStudyDayISO: string | null;
  currentStreak: number;
  problemsPerDay: number;
  targetProblems: number;
}

export function MissedDayCard(props: MissedDayCardProps) {
  const { daysSinceLastStudy, currentStreak, problemsPerDay, targetProblems } = props;

  // Show only when yesterday was missed (no study day). If user has never
  // studied (null) or is mid-streak (daysSinceLastStudy === 0), skip.
  if (daysSinceLastStudy === null) return null;
  if (daysSinceLastStudy === 0) return null;

  // If they were on a streak that just broke, ComebackCard handles it.
  if (currentStreak === 0 && daysSinceLastStudy >= 2) return null;

  // One day missed mid-streak: a yellow nudge.
  if (currentStreak > 0) return null; // already on a fresh streak — nothing missed

  // For the (rare) case currentStreak === 0 but daysSinceLastStudy === 1
  const slipDays = Math.max(
    1,
    Math.round((targetProblems || 1) / Math.max(problemsPerDay, 0.5))
  );

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-start gap-4"
      style={{
        background:
          "linear-gradient(90deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.02))",
        border: "1px solid rgba(168, 85, 247, 0.3)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(168, 85, 247, 0.2)" }}
      >
        <CloudRain className="w-5 h-5 text-[var(--color-accent-purple)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--color-accent-purple)] flex items-center gap-2">
          Yesterday slipped your finish date by ~{slipDays} day
          {slipDays === 1 ? "" : "s"}
          <RotateCcw className="w-3.5 h-3.5" />
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Hit today&apos;s target to claw it back. One day at a time.
        </p>
      </div>
    </div>
  );
}
