import Link from "next/link";

interface PatternReadinessItem {
  id: string;
  name: string;
  completion: number;
  mastery: number;
  totalVideos: number;
  watchedVideos: number;
  totalProblems: number;
  solvedProblems: number;
  status: string;
}

export function PatternReadiness({ patterns }: { patterns: PatternReadinessItem[] }) {
  const getBarColor = (pct: number) => {
    if (pct >= 80) return "var(--color-accent-emerald)";
    if (pct >= 50) return "var(--color-accent-blue)";
    if (pct >= 20) return "var(--color-accent-amber)";
    return "var(--color-accent-red)";
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[var(--color-accent-emerald)]";
      case "IN_PROGRESS":
        return "bg-[var(--color-accent-blue)]";
      default:
        return "bg-[var(--color-text-muted)]";
    }
  };

  return (
    <div className="section-card p-7">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Placement readiness tracker
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Per-pattern completion across videos and problems.
          </p>
        </div>
        <Link
          href="/patterns"
          className="text-xs text-[var(--color-accent-blue)] hover:underline shrink-0"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
        {patterns.map((p) => {
          const barColor = getBarColor(p.completion);

          return (
            <Link
              key={p.id}
              href={`/patterns/${p.id}`}
              className="group flex items-center gap-3 py-2 -mx-2 px-2 rounded-md hover:bg-[var(--color-bg-card-hover)]/50 transition-colors"
            >
              {/* Status dot */}
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusDot(p.status)}`} />

              {/* Name, with the counts underneath so long pattern names fit */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-blue)] transition-colors">
                  {p.name}
                </p>
                <p className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
                  {p.watchedVideos}/{p.totalVideos} videos · {p.solvedProblems}/{p.totalProblems} problems
                </p>
              </div>

              {/* Progress bar */}
              <div className="hidden sm:block w-24 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${p.completion}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 6px ${barColor}40`,
                  }}
                />
              </div>

              {/* Percentage */}
              <span
                className="text-xs font-mono font-bold shrink-0 w-10 text-right"
                style={{ color: barColor }}
              >
                {Math.round(p.completion)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
