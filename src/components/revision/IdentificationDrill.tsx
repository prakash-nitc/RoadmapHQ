"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Clock,
  RotateCcw,
  Target,
} from "lucide-react";
import { getDrillReps, recordDrillResults, type DrillRep } from "@/lib/revision-actions";

type Phase = "config" | "loading" | "running" | "done";

interface RepResult {
  patternName: string;
  picked: string | null;
  correct: boolean;
  durationMs: number;
}

const PER_REP_SECONDS = 60;

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  EASY: { color: "#34d399", bg: "rgba(16,185,129,0.14)" },
  MEDIUM: { color: "#fbbf24", bg: "rgba(245,158,11,0.14)" },
  HARD: { color: "#f87171", bg: "rgba(239,68,68,0.14)" },
};

export function IdentificationDrill() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("config");
  const [count, setCount] = useState(15);
  const [reps, setReps] = useState<DrillRep[]>([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<RepResult[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PER_REP_SECONDS);

  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rep = reps[idx];

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Commit an answer (pick or timeout), stop the clock, show feedback.
  const commit = useCallback(
    (choice: string | null) => {
      if (answered) return;
      clearTimer();
      const cur = reps[idx];
      if (!cur) return;
      const correct = choice === cur.answer;
      setPicked(choice);
      setAnswered(true);
      setResults((r) => [
        ...r,
        {
          patternName: cur.answer,
          picked: choice,
          correct,
          durationMs: Date.now() - startedAtRef.current,
        },
      ]);
    },
    [answered, idx, reps]
  );

  // Run the per-rep timer while a rep is on screen. The countdown itself is put
  // back to 60 by the handlers that show a new rep (startDrill, next).
  useEffect(() => {
    if (phase !== "running" || answered) return;
    startedAtRef.current = Date.now();
    clearTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          commit(null); // timed out
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  const startDrill = async () => {
    setPhase("loading");
    const r = await getDrillReps(count);
    setReps(r);
    setIdx(0);
    setResults([]);
    setPicked(null);
    setAnswered(false);
    setSecondsLeft(PER_REP_SECONDS);
    setPhase("running");
  };

  const next = async () => {
    if (idx + 1 < reps.length) {
      setIdx((i) => i + 1);
      setPicked(null);
      setAnswered(false);
      setSecondsLeft(PER_REP_SECONDS);
    } else {
      clearTimer();
      // persist the whole run, then show the scorecard
      await recordDrillResults(results);
      setPhase("done");
      router.refresh();
    }
  };

  // ── CONFIG ──
  if (phase === "config" || phase === "loading") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <BackLink />
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(124,92,255,0.16)" }}>
            <Zap className="w-8 h-8 text-[var(--color-accent-purple)]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Pattern Recognition Drill</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
            Read a problem — title and pattern hidden — and name the pattern in {PER_REP_SECONDS}s.
            This is the OA skill: seeing the shape fast. No solving, just recognition.
          </p>
        </div>

        <div className="section-card p-5">
          <p className="eyebrow mb-3">How many reps?</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 25].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className="py-3 rounded-xl text-sm font-bold transition-transform hover:scale-[1.03]"
                style={
                  count === n
                    ? { background: "linear-gradient(90deg,#7c5cff,#a855f7)", color: "#fff" }
                    : { background: "rgba(255,255,255,0.05)", color: "var(--color-text-secondary)" }
                }
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={startDrill}
            disabled={phase === "loading"}
            className="w-full mt-4 py-3.5 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(90deg,#7c5cff,#4f8cff)", boxShadow: "0 8px 24px -6px rgba(124,92,255,0.5)" }}
          >
            {phase === "loading" ? "Loading…" : <>Start drill <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (phase === "done") {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const band = bandFor(acc);

    const missByPattern = new Map<string, number>();
    for (const r of results) if (!r.correct) missByPattern.set(r.patternName, (missByPattern.get(r.patternName) ?? 0) + 1);
    const weak = [...missByPattern.entries()].sort((a, b) => b[1] - a[1]);

    return (
      <div className="max-w-xl mx-auto space-y-6">
        <BackLink />
        <div className="section-card p-6 text-center">
          <p className="eyebrow mb-2">Recognition score</p>
          <div className="text-6xl font-bold font-mono mb-1" style={{ color: band.color }}>{acc}%</div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {correct} / {total} identified correctly
          </p>
          <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{ color: band.color, background: band.bg }}>
            {band.label}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-3 max-w-sm mx-auto">{band.note}</p>
        </div>

        {weak.length > 0 && (
          <div className="section-card p-5">
            <p className="eyebrow mb-3 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Patterns you missed</p>
            <div className="space-y-2">
              {weak.map(([name, misses]) => (
                <div key={name} className="flex items-center justify-between glass-row rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">{name}</span>
                  <span className="text-xs font-mono text-[#f87171]">missed {misses}×</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
              Practice these patterns in the Revision Corner — refresh the concept, then solve fresh problems.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setPhase("config")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg,#7c5cff,#4f8cff)" }}
          >
            <RotateCcw className="w-4 h-4" /> Drill again
          </button>
          <Link href="/revision" className="flex-1 py-3 rounded-xl text-sm font-semibold text-center glass-row">
            Back to Revision
          </Link>
        </div>
      </div>
    );
  }

  // ── RUNNING ──
  if (!rep) return null;
  const diff = DIFF_STYLE[rep.difficulty] ?? DIFF_STYLE.MEDIUM;
  const timePct = (secondsLeft / PER_REP_SECONDS) * 100;
  const timeColor = secondsLeft <= 10 ? "#f87171" : secondsLeft <= 25 ? "#fbbf24" : "#22d3ee";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress + timer */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          {idx + 1} / {reps.length}
        </span>
        <div className="flex items-center gap-1.5 text-sm font-mono font-bold" style={{ color: timeColor }}>
          <Clock className="w-4 h-4" /> {secondsLeft}s
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full transition-all duration-1000 ease-linear" style={{ width: `${timePct}%`, background: timeColor }} />
      </div>

      {/* Statement */}
      <div className="section-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: diff.color, background: diff.bg }}>
            {rep.difficulty}
          </span>
          <span className="eyebrow">Which pattern?</span>
        </div>
        <p className="text-lg leading-relaxed text-[var(--color-text-primary)]">{rep.text}</p>
      </div>

      {/* Choices */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        {rep.choices.map((choice) => {
          const isAnswer = choice === rep.answer;
          const isPicked = choice === picked;
          let style: React.CSSProperties = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-primary)" };
          if (answered) {
            if (isAnswer) style = { background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.5)", color: "#6ee7b7" };
            else if (isPicked) style = { background: "rgba(239,68,68,0.16)", border: "1px solid rgba(239,68,68,0.5)", color: "#fca5a5" };
            else style = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "var(--color-text-muted)" };
          }
          return (
            <button
              key={choice}
              onClick={() => commit(choice)}
              disabled={answered}
              className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-transform enabled:hover:scale-[1.02]"
              style={style}
            >
              <span>{choice}</span>
              {answered && isAnswer && <Check className="w-4 h-4 shrink-0" />}
              {answered && isPicked && !isAnswer && <X className="w-4 h-4 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Feedback + next */}
      {answered && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-sm font-semibold" style={{ color: picked === rep.answer ? "#34d399" : "#f87171" }}>
            {picked === rep.answer ? "Correct" : picked === null ? "Time's up" : "Not quite"}
          </span>
          <button
            onClick={next}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(90deg,#7c5cff,#4f8cff)" }}
          >
            {idx + 1 < reps.length ? "Next" : "See score"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/revision" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
      <ArrowLeft className="w-3.5 h-3.5" /> Revision Corner
    </Link>
  );
}

function bandFor(acc: number): { label: string; color: string; bg: string; note: string } {
  if (acc >= 85) return { label: "OA-ready recognition", color: "#34d399", bg: "rgba(16,185,129,0.14)", note: "You see the pattern fast. Keep this sharp with a weekly drill." };
  if (acc >= 65) return { label: "Functional, but slow", color: "#fbbf24", bg: "rgba(245,158,11,0.14)", note: "You get there, but hesitation costs time in an OA. Drill the misses." };
  if (acc >= 45) return { label: "This is your bottleneck", color: "#fb923c", bg: "rgba(249,115,22,0.14)", note: "Recognition — not solving — is what's holding you back right now. Focus here." };
  return { label: "Run a repair sprint", color: "#f87171", bg: "rgba(239,68,68,0.14)", note: "Rebuild recognition from the concepts up before more fresh problems." };
}
