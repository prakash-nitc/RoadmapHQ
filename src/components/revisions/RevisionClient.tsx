"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeRevision, skipRevision } from "@/lib/actions";
import {
  RotateCcw,
  CheckCircle2,
  SkipForward,
  ExternalLink,
  CalendarDays,
  Clock,
  AlertCircle,
} from "lucide-react";

interface RevisionItem {
  id: string;
  problemTitle: string;
  problemUrl: string;
  patternName: string;
  scheduledDate: string;
  completedDate: string | null;
  revisionNumber: number;
  status: string;
}

export function RevisionClient({
  todayRevisions,
  upcomingRevisions,
  completedRevisions,
}: {
  todayRevisions: RevisionItem[];
  upcomingRevisions: RevisionItem[];
  completedRevisions: RevisionItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = (id: string) => {
    startTransition(async () => {
      await completeRevision(id);
      router.refresh();
    });
  };

  const handleSkip = (id: string) => {
    startTransition(async () => {
      await skipRevision(id);
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revision center</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Spaced repetition · 3 → 7 → 14 → 30 → 60 days
        </p>
      </div>

      {/* Today's Revisions */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-[var(--color-accent-amber)]" />
          <h2 className="text-sm font-bold text-[var(--color-accent-amber)]">
            Due today
            <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)]">{todayRevisions.length}</span>
          </h2>
        </div>
        {todayRevisions.length === 0 ? (
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-accent-emerald)] mx-auto mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">All caught up! No revisions due today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-accent-amber)] border-opacity-30 hover:bg-[var(--color-bg-card-hover)] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-amber-dim)] flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4.5 h-4.5 text-[var(--color-accent-amber)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{rev.problemTitle}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {rev.patternName} · Revision #{rev.revisionNumber}
                  </p>
                </div>
                <a
                  href={rev.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                </a>
                <button
                  onClick={() => handleComplete(rev.id)}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-[var(--color-accent-emerald-dim)] text-[var(--color-accent-emerald)] text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
                >
                  Done
                </button>
                <button
                  onClick={() => handleSkip(rev.id)}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] text-xs font-medium rounded-lg hover:opacity-80 transition-opacity"
                >
                  Skip
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-[var(--color-accent-blue)]" />
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            Upcoming 7 days
            <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)]">{upcomingRevisions.length}</span>
          </h2>
        </div>
        {upcomingRevisions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-4">No upcoming revisions.</p>
        ) : (
          <div className="space-y-1.5">
            {upcomingRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)]"
              >
                <span className="text-xs font-mono text-[var(--color-accent-blue)] w-16 shrink-0">
                  {rev.scheduledDate}
                </span>
                <p className="text-sm text-[var(--color-text-primary)] flex-1 truncate">{rev.problemTitle}</p>
                <span className="text-xs text-[var(--color-text-muted)]">Rev #{rev.revisionNumber}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            Recent history
          </h2>
        </div>
        {completedRevisions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] py-4">No revision history yet.</p>
        ) : (
          <div className="space-y-1.5">
            {completedRevisions.map((rev) => (
              <div
                key={rev.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] opacity-70"
              >
                {rev.status === "COMPLETED" ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-emerald)] shrink-0" />
                ) : (
                  <SkipForward className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                )}
                <p className="text-sm text-[var(--color-text-secondary)] flex-1 truncate">{rev.problemTitle}</p>
                <span className="text-xs text-[var(--color-text-muted)]">{rev.completedDate}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
