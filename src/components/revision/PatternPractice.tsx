"use client";

import { useState, useTransition } from "react";
import {
  X,
  BookOpen,
  ExternalLink,
  Code2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flag,
  NotebookPen,
  Lightbulb,
} from "lucide-react";
import { completePatternPractice, markCoreResolved } from "@/lib/revision-actions";

interface CoreProblem {
  id: string;
  title: string;
  url: string;
  anchorInsight: string | null;
  difficulty: string | null;
  status: string;
}

interface DuePattern {
  id: string;
  name: string;
  order: number;
  revStep: number;
  revFailCount: number;
  propeersTopic: string | null;
  propeersSub: string | null;
  notesHint: string | null;
  daysOverdue: number;
  core: CoreProblem[];
}

type Step = "refresh" | "fresh" | "core" | "verdict";

export function PatternPractice({
  patterns,
  propeersUrl,
  onExit,
}: {
  patterns: DuePattern[];
  propeersUrl: string | null;
  onExit: () => void;
}) {
  const [pIndex, setPIndex] = useState(0);
  const [step, setStep] = useState<Step>("refresh");
  const [coreMarks, setCoreMarks] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const total = patterns.length;
  const p = patterns[pIndex];

  const nextPattern = () => {
    setStep("refresh");
    setCoreMarks({});
    setRevealed({});
    setPIndex((i) => i + 1);
  };

  const finishPattern = (outcome: "solid" | "shaky") => {
    if (!p) return;
    startTransition(async () => {
      await completePatternPractice(p.id, outcome);
      nextPattern();
    });
  };

  const markCore = (problemId: string, passed: boolean) => {
    setCoreMarks((m) => ({ ...m, [problemId]: passed }));
    startTransition(async () => {
      await markCoreResolved(problemId, passed);
    });
  };

  // Done
  if (!p || pIndex >= total) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(16,185,129,0.14)" }}>
          <Flag className="w-8 h-8 text-[var(--color-accent-emerald)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Practice done for today</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Each solid pattern pushed its next review out; anything shaky comes back in 2 days.
            Fresh problems in the pattern are what build the recognition — that&apos;s the win.
          </p>
        </div>
        <button onClick={onExit} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}>
          Done
        </button>
      </div>
    );
  }

  const propeersHref = propeersUrl || null;
  const progress = Math.round((pIndex / total) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Pattern practice</span>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{pIndex + 1}/{total}</span>
        </div>
        <button onClick={onExit} className="p-1.5 rounded-lg glass-row" title="Exit (progress saved)">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }} />
      </div>

      {/* Pattern header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[var(--color-accent-purple)] text-sm">#{String(p.order).padStart(2, "0")}</span>
        <h2 className="text-2xl font-bold">{p.name}</h2>
        {p.daysOverdue > 0 && <span className="text-[10px] font-mono text-[var(--color-accent-amber)]">{p.daysOverdue}d overdue</span>}
      </div>

      {/* Step chips */}
      <div className="flex items-center gap-2 text-[11px]">
        {(["refresh", "fresh", "core"] as Step[]).map((s, i) => {
          const active = step === s;
          const labels = { refresh: "1 · Refresh", fresh: "2 · Fresh problems", core: "3 · Cold re-solve" } as Record<Step, string>;
          return (
            <span key={s} className="px-2.5 py-1 rounded-full font-semibold" style={active ? { background: "linear-gradient(90deg,#22d3ee,#4f8cff)", color: "#fff" } : { background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)" }}>
              {labels[s]}
            </span>
          );
        })}
      </div>

      {/* ─── STEP 1: Refresh ─── */}
      {step === "refresh" && (
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), transparent 60%), rgba(20,20,30,0.55)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <NotebookPen className="w-5 h-5 text-[var(--color-accent-purple)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">Refresh the concept</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Open your notebook for <span className="font-semibold text-[var(--color-text-primary)]">{p.name}</span> — re-read the core idea,
                the template, and when it applies. Say the template out loud once.
              </p>
            </div>
          </div>
          {p.core.length > 0 && (
            <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(79,140,255,0.06)", border: "1px solid rgba(79,140,255,0.15)" }}>
              <p className="eyebrow mb-2 flex items-center gap-1.5"><Lightbulb className="w-3 h-3" /> The CORE ideas, as a backup</p>
              <ul className="space-y-1.5">
                {p.core.filter((c) => c.anchorInsight).slice(0, 5).map((c) => (
                  <li key={c.id} className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    <span className="text-[var(--color-text-primary)] font-medium">{c.title}:</span> {c.anchorInsight}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setStep("fresh")} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#a855f7,#7c3aed)" }}>
            Refreshed — next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── STEP 2: Fresh problems (Propeers) ─── */}
      {step === "fresh" && (
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.08), transparent 60%), rgba(20,20,30,0.55)", border: "1px solid rgba(34,211,238,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <Code2 className="w-5 h-5 text-[#22d3ee] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">Solve 2–3 fresh problems</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Unseen problems in this pattern are what build recognition and muscle memory — not re-reading old ones.
              </p>
            </div>
          </div>

          {p.propeersTopic ? (
            <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="eyebrow mb-1">On Propeers</p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{p.propeersTopic}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.propeersSub}</p>
              {propeersHref && (
                <a href={propeersHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Open Propeers
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-xl p-4 mb-4 text-xs text-[var(--color-text-muted)]" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              No Propeers track for this pattern — solve a few from your sheet or the LeetCode tag instead.
            </div>
          )}

          <button onClick={() => setStep("core")} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}>
            Solved a few — next <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => setStep("core")} className="w-full mt-2 py-2 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
            Skip for now
          </button>
        </div>
      )}

      {/* ─── STEP 3: Cold re-solve CORE ─── */}
      {step === "core" && (
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, rgba(79,140,255,0.08), transparent 60%), rgba(20,20,30,0.55)", border: "1px solid rgba(79,140,255,0.2)" }}>
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--color-accent-blue)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold">Cold re-solve 1–2 CORE anchors</h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Your own CORE problems, notes closed. These are the ones that regenerate the rest.
              </p>
            </div>
          </div>

          {p.core.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] mb-4">No CORE anchors tagged for this pattern yet.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {p.core.map((c) => {
                const marked = coreMarks[c.id];
                return (
                  <div key={c.id} className="glass-row rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent-blue)]">
                        <span className="truncate">{c.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-[var(--color-text-muted)]" />
                      </a>
                      {marked === undefined ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => markCore(c.id, false)} disabled={isPending} className="p-1.5 rounded-md" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }} title="Missed"><XCircle className="w-4 h-4" /></button>
                          <button onClick={() => markCore(c.id, true)} disabled={isPending} className="p-1.5 rounded-md" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }} title="Solved clean"><CheckCircle2 className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold shrink-0" style={{ color: marked ? "#34d399" : "#f87171" }}>
                          {marked ? "clean" : "missed"}
                        </span>
                      )}
                    </div>
                    {c.anchorInsight && (
                      <button onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))} className="text-[11px] text-[var(--color-accent-blue)] mt-1.5 hover:underline">
                        {revealed[c.id] ? "hide insight" : "reveal insight"}
                      </button>
                    )}
                    {revealed[c.id] && c.anchorInsight && (
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{c.anchorInsight}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={() => setStep("verdict")} className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#4f8cff,#3b6fd4)" }}>
            Done — how did it feel? <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── VERDICT ─── */}
      {step === "verdict" && (
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(20,20,30,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="text-base font-bold mb-1">How solid is {p.name}?</h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-5">
            Solid pushes the next review out; shaky brings it back in 2 days.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => finishPattern("shaky")} disabled={isPending} className="py-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24" }}>
              Shaky — see it soon
            </button>
            <button onClick={() => finishPattern("solid")} disabled={isPending} className="py-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}>
              Solid — space it out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
