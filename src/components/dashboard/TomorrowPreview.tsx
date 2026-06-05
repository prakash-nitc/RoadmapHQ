import Link from "next/link";
import { Sunrise, ArrowRight } from "lucide-react";

interface TomorrowPreviewProps {
  pattern: { id: string; name: string } | null;
  nextVideo: { id: string; episodeNumber: number; title: string } | null;
  unsolvedCount: number;
}

export function TomorrowPreview({
  pattern,
  nextVideo,
  unsolvedCount,
}: TomorrowPreviewProps) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(168, 85, 247, 0.08) 60%, transparent)",
        border: "1px solid rgba(251, 191, 36, 0.25)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "rgba(251, 191, 36, 0.2)" }}
        >
          <Sunrise className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
              Today, won.
            </p>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">
              Tomorrow you&apos;ll tackle…
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[var(--color-bg-primary)]/40 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                Pattern
              </p>
              {pattern ? (
                <Link
                  href={`/patterns/${pattern.id}`}
                  className="text-sm font-bold text-[var(--color-text-primary)] hover:text-amber-400 transition-colors"
                >
                  {pattern.name} →
                </Link>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Start a new pattern
                </p>
              )}
            </div>

            <div className="bg-[var(--color-bg-primary)]/40 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
                Next up
              </p>
              {nextVideo ? (
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  Ep {nextVideo.episodeNumber} · {nextVideo.title}
                </p>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Pattern complete — pick a new one
                </p>
              )}
            </div>
          </div>

          {unsolvedCount > 0 && pattern && (
            <Link
              href="/problems"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-amber-400 hover:underline"
            >
              {unsolvedCount} problems queued in {pattern.name}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
