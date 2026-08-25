"use client";

import { useState, useTransition } from "react";
import {
  X,
  Volume2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  Flag,
  PenLine,
  Timer,
  Layers,
} from "lucide-react";
import { reviewProblem } from "@/lib/revision-actions";

type Mode = "RECALL" | "SKELETON" | "COLD" | "MIXED";

interface DueItem {
  id: string;
  title: string;
  url: string;
  tier: string | null;
  anchorInsight: string | null;
  difficulty: string | null;
  status: string;
  failCount: number;
  revisionStep: number;
  mode: Mode;
  patternName: string;
  patternOrder: number;
  daysOverdue: number;
}

const MODE_META: Record<Mode, { label: string; blurb: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  RECALL: { label: "Recall", blurb: "60-90s, notes closed. Say it out loud.", color: "#22d3ee", icon: Volume2 },
  SKELETON: { label: "Skeleton", blurb: "5 min on paper. Signature + core loop + the 3-4 logic lines.", color: "#a855f7", icon: PenLine },
  COLD: { label: "Cold re-solve", blurb: "20-min timebox, IDE open, notes closed. It must actually pass.", color: "#4f8cff", icon: Timer },
  MIXED: { label: "Monthly touch", blurb: "Untagged mixed set. Passing here earns Mastered.", color: "#10b981", icon: Layers },
};

export function ReviewSession({ items, onExit }: { items: DueItem[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pass, setPass] = useState(0);
  const [fail, setFail] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = items.length;
  const current = items[index];
  const effectiveMode = mode ?? current?.mode ?? "RECALL";

  const advance = () => {
    setRevealed(false);
    setMode(null);
    setIndex((i) => i + 1);
  };

  const record = (passed: boolean, openedNotes: boolean) => {
    if (!current) return;
    startTransition(async () => {
      await reviewProblem(current.id, effectiveMode, passed, openedNotes);
      if (passed && !openedNotes) setPass((c) => c + 1);
      else setFail((c) => c + 1);
      advance();
    });
  };

  if (!current || index >= total) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "rgba(16,185,129,0.14)" }}>
          <Flag className="w-8 h-8 text-[var(--color-accent-emerald)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Queue cleared</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {pass} retained · {fail} sent back for repair. Each pass pushed its next review further out;
            each miss comes back in 3 days. A maintained day.
          </p>
        </div>
        <button
          onClick={onExit}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}
        >
          Done
        </button>
      </div>
    );
  }

  const mm = MODE_META[effectiveMode];
  const ModeIcon = mm.icon;
  const progress = Math.round(((pass + fail) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">Today&apos;s review</span>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{pass + fail}/{total}</span>
        </div>
        <button onClick={onExit} className="p-1.5 rounded-lg glass-row" title="Exit (progress saved)">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }} />
      </div>

      {/* Pattern + overdue */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="font-mono text-[var(--color-accent-purple)]">#{String(current.patternOrder).padStart(2, "0")}</span>
        <span className="text-[var(--color-text-secondary)]">{current.patternName}</span>
        {current.tier && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={current.tier === "CORE" ? { background: "rgba(79,140,255,0.16)", color: "#7ba9ff" } : { background: "rgba(168,85,247,0.14)", color: "#c084fc" }}>
            {current.tier}
          </span>
        )}
        {current.daysOverdue > 0 && (
          <span className="text-[10px] font-mono text-[var(--color-accent-amber)]">{current.daysOverdue}d overdue</span>
        )}
        {current.failCount >= 2 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.16)", color: "#f87171" }}>RELEARN</span>
        )}
      </div>

      {/* The card */}
      <div className="rounded-2xl p-7 md:p-9" style={{ background: "linear-gradient(135deg, rgba(79,140,255,0.08), rgba(168,85,247,0.06)), rgba(20,20,30,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-5">
          <span className="eyebrow">Mode</span>
          <div className="flex gap-1.5">
            {(["RECALL", "SKELETON", "COLD"] as Mode[]).map((m) => {
              const active = effectiveMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all"
                  style={active ? { background: MODE_META[m].color, color: "#0b0b12" } : { background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)" }}
                >
                  {MODE_META[m].label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="eyebrow mb-2">{effectiveMode === "RECALL" ? "Problem — title only" : "Problem"}</p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-5">{current.title}</h2>

        {/* Mode instruction */}
        <div className="flex items-start gap-2 rounded-xl p-4 mb-5" style={{ background: `${mm.color}14`, border: `1px solid ${mm.color}33` }}>
          <ModeIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: mm.color }} />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <span className="font-semibold" style={{ color: mm.color }}>{mm.label}.</span> {mm.blurb}
          </p>
        </div>

        {/* Cold re-solve gets a direct open button */}
        {effectiveMode === "COLD" && (
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#4f8cff,#3b6fd4)" }}
          >
            <ExternalLink className="w-4 h-4" /> Open on the platform &amp; solve cold
          </a>
        )}

        {/* Reveal insight */}
        {revealed ? (
          <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="eyebrow mb-1.5">The insight</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {current.anchorInsight ?? "No stored insight — check against your own notes."}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-5 text-sm font-medium text-[var(--color-accent-blue)]"
            style={{ background: "rgba(79,140,255,0.08)", border: "1px solid rgba(79,140,255,0.2)" }}
          >
            <Eye className="w-4 h-4" /> Reveal to self-check
          </button>
        )}

        {/* Verdict */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => record(false, false)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}
          >
            <XCircle className="w-4 h-4" /> Missed it
          </button>
          <button
            onClick={() => record(true, false)}
            disabled={isPending}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "rgba(16,185,129,0.14)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399" }}
          >
            <CheckCircle2 className="w-4 h-4" /> Got it clean
          </button>
        </div>

        {/* Escape procedure */}
        <button
          onClick={() => record(false, true)}
          disabled={isPending}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <BookOpen className="w-3.5 h-3.5" /> I had to open my notes — costs a re-solve (+3 days, back to Attempted)
        </button>
      </div>

      {/* Tally */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--color-accent-emerald)]"><CheckCircle2 className="w-3.5 h-3.5" /> {pass} clean</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--color-accent-red)]"><XCircle className="w-3.5 h-3.5" /> {fail} back to repair</span>
      </div>
    </div>
  );
}
