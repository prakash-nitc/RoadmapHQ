"use client";

import { RotateCcw, CheckCircle2, SkipForward } from "lucide-react";
import { completeRevision, skipRevision } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface Revision {
  id: string;
  problemTitle: string;
  patternName: string;
  scheduledDate: string;
  revisionNumber: number;
}

export function RevisionQueue({ revisions }: { revisions: Revision[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
    <div className="section-card p-5 flex flex-col w-full min-h-[360px]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Revision engine
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Spaced repetition keeps mastery from decaying.
          </p>
        </div>
        {revisions.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[var(--color-accent-amber-dim)] text-[var(--color-accent-amber)]">
            {revisions.length} due
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col min-h-0">

      {revisions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--color-accent-emerald-dim)]/40 ring-1 ring-[var(--color-accent-emerald)]/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-[var(--color-accent-emerald)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No revisions due today
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 max-w-[240px]">
            Solve problems to start building your revision queue.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] group hover:border-[var(--color-accent-amber)] transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-[var(--color-accent-amber-dim)] flex items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {rev.problemTitle}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {rev.patternName} · Rev #{rev.revisionNumber}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleComplete(rev.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-md hover:bg-[var(--color-accent-emerald-dim)] transition-colors"
                  title="Mark completed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-emerald)]" />
                </button>
                <button
                  onClick={() => handleSkip(rev.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-md hover:bg-[var(--color-bg-card)] transition-colors"
                  title="Skip"
                >
                  <SkipForward className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
