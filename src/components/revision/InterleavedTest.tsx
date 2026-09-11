"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Clock,
  Check,
  X,
  Target,
  RotateCcw,
} from "lucide-react";
import {
  getInterleavedReps,
  recordDrillResults,
  type DrillRep,
} from "@/lib/revision-actions";

type Phase = "intro" | "loading" | "running" | "done";

interface RepResult {
  patternName: string;
  picked: string | null;
  correct: boolean;
  durationMs: number;
}

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  EASY: { color: "#34d399", bg: "rgba(16,185,129,0.14)" },
  MEDIUM: { color: "#fbbf24", bg: "rgba(245,158,11,0.14)" },
  HARD: { color: "#f87171", bg: "rgba(239,68,68,0.14)" },
};

function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function InterleavedTest({
  lastTestAt,
  stale,
}: {
  lastTestAt: string | null;
  stale: boolean; // due for this week's test — decided on the server (getTestStatus)
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [reps, setReps] = useState<DrillRep[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [results, setResults] = useState<RepResult[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef(0);
  const repStartRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // One clock for the whole test (spec: a single timer, not per problem).
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const start = async () => {
    setPhase("loading");
    const r = await getInterleavedReps();
    setReps(r);
    setAnswers(new Array(r.length).fill(null));
    setResults([]);
    setIdx(0);
    startRef.current = Date.now();
    repStartRef.current = Date.now();
    setElapsed(0);
    setPhase("running");
  };

  const pick = (choice: string) => {
    const cur = reps[idx];
    if (!cur) return;
    setAnswers((a) => {
      const n = [...a];
      n[idx] = choice;
      return n;
    });
  };

  const next = async () => {
    const cur = reps[idx];
    if (!cur) return;
    const choice = answers[idx];
    const result: RepResult = {
      patternName: cur.answer,
      picked: choice,
      correct: choice === cur.answer,
      durationMs: Date.now() - repStartRef.current,
    };
    const nextResults = [...results, result];
    setResults(nextResults);

    if (idx + 1 < reps.length) {
      setIdx((i) => i + 1);
      repStartRef.current = Date.now();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      await recordDrillResults(nextResults, "TEST");
      setPhase("done");
      router.refresh();
    }
  };

  // ── INTRO ──
  if (phase === "intro" || phase === "loading") {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <BackLink />
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(56,189,248,0.16)" }}>
            <Shuffle className="w-8 h-8 text-[#38bdf8]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Interleaved Test</h1>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
            10 problems drawn from at least 8 different patterns, shuffled together.
            No pattern tags, no feedback until the end — this is the exam, not practice.
          </p>
        </div>

        <div className="section-card p-5 space-y-3">
          <Row label="Problems" value="10" />
          <Row label="Patterns covered" value="8+ (mixed)" />
          <Row label="Feedback" value="Held until the end" />
          <Row
            label="Last taken"
            value={lastTestAt ? formatDistanceToNow(new Date(lastTestAt), { addSuffix: true }) : "Never"}
          />
        </div>

        {stale && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.25)", color: "var(--color-text-secondary)" }}>
            Blocked practice makes you feel ready; interleaving tells you if you are.
            Take this once a week.
          </div>
        )}

        <button
          onClick={start}
          disabled={phase === "loading"}
          className="w-full py-3.5 rounded-xl text-base font-semibold text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
          style={{ background: "linear-gradient(90deg,#38bdf8,#4f8cff)", boxShadow: "0 8px 24px -6px rgba(56,189,248,0.5)" }}
        >
          {phase === "loading" ? "Building test…" : <>Start test <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    );
  }

  // ── DONE ──
  if (phase === "done") {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const band = bandFor(acc);

    const missed = results.filter((r) => !r.correct);
    const missedPatterns = [...new Set(missed.map((r) => r.patternName))];

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <BackLink />
        <div className="section-card p-6 text-center">
          <p className="eyebrow mb-2">Interleaved score</p>
          <div className="text-6xl font-bold font-mono mb-1" style={{ color: band.color }}>
            {correct}<span className="text-3xl text-[var(--color-text-muted)]">/{total}</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {acc}% identified · {fmtClock(elapsed)} total
          </p>
          <div className="mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold" style={{ color: band.color, background: band.bg }}>
            {band.label}
          </div>
        </div>

        {/* Per-item breakdown — patterns revealed only now */}
        <div className="section-card p-5">
          <p className="eyebrow mb-3">Answer key</p>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 glass-row rounded-lg px-3 py-2">
                {r.correct ? (
                  <Check className="w-4 h-4 shrink-0 text-[#34d399]" />
                ) : (
                  <X className="w-4 h-4 shrink-0 text-[#f87171]" />
                )}
                <span className="text-xs font-medium text-[var(--color-text-primary)] flex-1 truncate">
                  {r.patternName}
                </span>
                {!r.correct && (
                  <span className="text-[11px] text-[var(--color-text-muted)] shrink-0">
                    you said {r.picked ?? "—"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The week plan */}
        {missedPatterns.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.12), transparent 65%), rgba(20,20,30,0.5)", border: "1px solid rgba(245,158,11,0.26)" }}>
            <p className="eyebrow mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Lead with these this week</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {missedPatterns.map((p) => (
                <span key={p} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: "#fbbf24", background: "rgba(245,158,11,0.16)" }}>
                  {p}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              You didn&apos;t recognise these under interleaving — that&apos;s the real gap.
              Practice each in the Revision Corner: refresh the concept, then fresh problems.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setPhase("intro")} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#38bdf8,#4f8cff)" }}>
            <RotateCcw className="w-4 h-4" /> Retake
          </button>
          <Link href="/revision" className="flex-1 py-3 rounded-xl text-sm font-semibold text-center glass-row">
            Back to Revision
          </Link>
        </div>
      </div>
    );
  }

  // ── RUNNING ──
  const rep = reps[idx];
  if (!rep) return null;
  const diff = DIFF_STYLE[rep.difficulty] ?? DIFF_STYLE.MEDIUM;
  const chosen = answers[idx];
  const progress = ((idx) / reps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          {idx + 1} / {reps.length}
        </span>
        <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-[#38bdf8]">
          <Clock className="w-4 h-4" /> {fmtClock(elapsed)}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#38bdf8,#4f8cff)" }} />
      </div>

      <div className="section-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: diff.color, background: diff.bg }}>
            {rep.difficulty}
          </span>
          <span className="eyebrow">Which pattern?</span>
        </div>
        <p className="text-lg leading-relaxed text-[var(--color-text-primary)]">{rep.text}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {rep.choices.map((choice) => {
          const selected = chosen === choice;
          return (
            <button
              key={choice}
              onClick={() => pick(choice)}
              className="px-4 py-3.5 rounded-xl text-sm font-semibold text-left transition-transform hover:scale-[1.02]"
              style={
                selected
                  ? { background: "rgba(56,189,248,0.18)", border: "1px solid rgba(56,189,248,0.55)", color: "#7dd3fc" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-primary)" }
              }
            >
              {choice}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] text-[var(--color-text-muted)]">
          No feedback until the end — that&apos;s the test.
        </span>
        <button
          onClick={next}
          disabled={!chosen}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-40"
          style={{ background: "linear-gradient(90deg,#38bdf8,#4f8cff)" }}
        >
          {idx + 1 < reps.length ? "Next" : "Submit test"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
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

function bandFor(acc: number): { label: string; color: string; bg: string } {
  if (acc >= 80) return { label: "Interleaving-proof", color: "#34d399", bg: "rgba(16,185,129,0.14)" };
  if (acc >= 60) return { label: "Holds up, with gaps", color: "#fbbf24", bg: "rgba(245,158,11,0.14)" };
  if (acc >= 40) return { label: "Block practice illusion", color: "#fb923c", bg: "rgba(249,115,22,0.14)" };
  return { label: "Recognition not built yet", color: "#f87171", bg: "rgba(239,68,68,0.14)" };
}
