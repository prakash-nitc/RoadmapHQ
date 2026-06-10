import { Heart } from "lucide-react";

interface ComebackCardProps {
  daysSinceLastStudy: number | null;
  currentStreak: number;
  longestStreak: number;
  lastStudyDayISO: string | null;
}

export function ComebackCard({
  daysSinceLastStudy,
  currentStreak,
  longestStreak,
  lastStudyDayISO,
}: ComebackCardProps) {
  // Shows after a 3+ day gap; a single missed day (gap of exactly 2) is
  // handled by MissedDayCard so the two never overlap.
  if (currentStreak > 0) return null;
  if (daysSinceLastStudy === null || daysSinceLastStudy < 3) return null;

  const formattedLast = lastStudyDayISO
    ? new Date(lastStudyDayISO).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="rounded-2xl px-5 py-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(168, 85, 247, 0.08) 60%, transparent)",
        border: "1px solid rgba(34, 211, 238, 0.3)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(34, 211, 238, 0.2)" }}
        >
          <Heart className="w-5 h-5 text-[#22d3ee]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Welcome back
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Your last study day was{" "}
            <span className="font-mono text-[var(--color-text-primary)]">
              {formattedLast ?? `${daysSinceLastStudy} days ago`}
            </span>
            . {longestStreak >= 7 ? `You hit ${longestStreak} days before. ` : ""}
            No shame — just open day 1 of the new chain.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 italic">
            The only thing that breaks a streak is staying broken. Today fixes it.
          </p>
        </div>
      </div>
    </div>
  );
}
