"use client";

import { useEffect, useState, useTransition } from "react";
import {
  X,
  Check,
  Volume2,
  Eye,
  CheckCircle2,
  XCircle,
  Flag,
  Loader2,
} from "lucide-react";
import {
  startAssessment,
  recordAssessmentResult,
  completeAssessment,
  cancelAssessment,
} from "@/lib/revision-actions";

interface AProblem {
  id: string;
  title: string;
  status: string;
  tier: string | null;
  anchorInsight: string | null;
  difficulty: string | null;
  patternId: string;
  patternName: string;
  patternOrder: number;
  alreadyMarked: boolean | null;
}

export function DamageAssessment({ onExit }: { onExit: () => void }) {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [problems, setProblems] = useState<AProblem[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const res = await startAssessment();
      setAssessmentId(res.assessmentId);
      setProblems(res.problems as AProblem[]);
      // Resume at the first unmarked problem.
      const firstUnmarked = res.problems.findIndex((p) => p.alreadyMarked === null);
      setIndex(firstUnmarked === -1 ? res.problems.length : firstUnmarked);
      setPassCount(res.problems.filter((p) => p.alreadyMarked === true).length);
      setFailCount(res.problems.filter((p) => p.alreadyMarked === false).length);
      setLoading(false);
    })();
  }, []);

  const total = problems.length;
  const current = problems[index];

  const mark = (passed: boolean) => {
    if (!assessmentId || !current) return;
    startTransition(async () => {
      await recordAssessmentResult(assessmentId, current.id, passed);
      if (passed) setPassCount((c) => c + 1);
      else setFailCount((c) => c + 1);
      setRevealed(false);
      if (index + 1 >= total) {
        setIndex(total);
      } else {
        setIndex((i) => i + 1);
      }
    });
  };

  const finish = () => {
    if (!assessmentId) return onExit();
    startTransition(async () => {
      await completeAssessment(assessmentId);
      onExit();
    });
  };

  const exitEarly = () => {
    if (!assessmentId) return onExit();
    startTransition(async () => {
      await cancelAssessment(assessmentId);
      onExit();
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-32 text-[var(--color-text-muted)]">
        <Loader2 className="w-6 h-6 animate-spin mb-3" />
        Preparing your recall set…
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-24">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Nothing to assess yet — solve some problems first, then come back to map what decayed.
        </p>
        <button onClick={onExit} className="mt-4 px-4 py-2 rounded-lg glass-row text-sm">Back</button>
      </div>
    );
  }

  // Completion screen
  if (done || index >= total) {
    const rate = total > 0 ? Math.round((failCount / (passCount + failCount || 1)) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(34,211,238,0.14)" }}>
          <Flag className="w-8 h-8 text-[#22d3ee]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Assessment complete</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {passCount} retained · {failCount} decayed · {rate}% overall decay. The failures are demoted and
            queued — repair at the pattern level, highest-decay first.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={finish}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, #22d3ee, #4f8cff)" }}
          >
            {isPending ? "Saving…" : "Save & see the map"}
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((passCount + failCount) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Damage assessment</span>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            {passCount + failCount}/{total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDone(true)}
            className="text-xs px-3 py-1.5 rounded-lg glass-row"
          >
            Finish early
          </button>
          <button onClick={exitEarly} className="p-1.5 rounded-lg glass-row" title="Discard & exit">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}
        />
      </div>

      {/* Pattern context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono text-[var(--color-accent-purple)]">#{String(current.patternOrder).padStart(2, "0")}</span>
        <span className="text-[var(--color-text-secondary)]">{current.patternName}</span>
        {current.tier && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={current.tier === "CORE" ? { background: "rgba(79,140,255,0.16)", color: "#7ba9ff" } : { background: "rgba(168,85,247,0.14)", color: "#c084fc" }}
          >
            {current.tier}
          </span>
        )}
      </div>

      {/* The recall card */}
      <div
        className="rounded-2xl p-7 md:p-9"
        style={{
          background: "linear-gradient(135deg, rgba(79,140,255,0.08), rgba(168,85,247,0.06)), rgba(20,20,30,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="eyebrow mb-2">Problem — title only</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{current.title}</h2>

        <div className="flex items-start gap-2 rounded-xl p-4 mb-6" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <Volume2 className="w-4 h-4 text-[var(--color-accent-amber)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <span className="text-[var(--color-accent-amber)] font-semibold">Out loud</span>, state: the pattern,
            the key insight, the time &amp; space complexity, and the one gotcha that bit you. Speaking forces
            production — thinking lets you skip the hard part.
          </p>
        </div>

        {revealed ? (
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="eyebrow mb-1.5">The insight</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {current.anchorInsight ?? "No anchor insight stored for this problem — check against your own notes."}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-6 text-sm font-medium text-[var(--color-accent-blue)] transition-colors"
            style={{ background: "rgba(79,140,255,0.08)", border: "1px solid rgba(79,140,255,0.2)" }}
          >
            <Eye className="w-4 h-4" /> Reveal to self-check
          </button>
        )}

        {/* Verdict */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => mark(false)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}
          >
            <XCircle className="w-4 h-4" /> Blank / wrong
          </button>
          <button
            onClick={() => mark(true)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}
          >
            <CheckCircle2 className="w-4 h-4" /> Recalled it
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-3">
          Fixing nothing now — a fail just demotes and queues it. Collect the data, plan the repair after.
        </p>
      </div>

      {/* Live tally */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--color-accent-emerald)]">
          <Check className="w-3.5 h-3.5" /> {passCount} retained
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--color-accent-red)]">
          <X className="w-3.5 h-3.5" /> {failCount} decayed
        </span>
      </div>
    </div>
  );
}
