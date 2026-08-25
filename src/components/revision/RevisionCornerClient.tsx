"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Stethoscope,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Play,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Zap,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { DamageAssessment } from "./DamageAssessment";
import { ReviewSession } from "./ReviewSession";

interface Overview {
  hasInProgress: boolean;
  inProgressId: string | null;
  latest: {
    id: string;
    date: string | Date | null;
    rates: {
      patternId: string;
      patternName: string;
      order: number;
      total: number;
      failed: number;
      failRate: number;
      delta: number | null;
    }[];
    overallFailRate: number;
  } | null;
  hasPrevious: boolean;
  solvedPlus: number;
  retained: number;
  retentionPct: number;
  coreCount: number;
  supportCount: number;
  learningMode: { id: string; title: string; patternName: string; failCount: number; tier: string | null }[];
}

interface AnchorPattern {
  id: string;
  name: string;
  order: number;
  core: { id: string; title: string; anchorInsight: string | null; status: string; difficulty: string | null; url: string; failCount: number }[];
  support: { id: string; title: string; anchorInsight: string | null; status: string; difficulty: string | null; url: string; failCount: number }[];
}

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
  mode: "RECALL" | "SKELETON" | "COLD" | "MIXED";
  patternName: string;
  patternOrder: number;
  daysOverdue: number;
}

interface DueQueue {
  total: number;
  recallCount: number;
  coldCount: number;
  items: DueItem[];
  nextDueAt: string | Date | null;
}

function rateColor(rate: number) {
  if (rate >= 60) return "#ef4444";
  if (rate >= 30) return "#f59e0b";
  return "#10b981";
}

export function RevisionCornerClient({
  overview,
  anchors,
  dueQueue,
}: {
  overview: Overview;
  anchors: AnchorPattern[];
  dueQueue: DueQueue;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"home" | "assessment" | "review">("home");

  if (mode === "assessment") {
    return (
      <DamageAssessment
        onExit={() => {
          setMode("home");
          router.refresh();
        }}
      />
    );
  }

  if (mode === "review") {
    return (
      <ReviewSession
        items={dueQueue.items}
        onExit={() => {
          setMode("home");
          router.refresh();
        }}
      />
    );
  }

  const usablePct = overview.retentionPct;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
          Retention &amp; repair
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Revision Corner</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-2xl">
          Solving builds the bank; revision keeps it solvent. A problem you can&apos;t re-solve
          cold is worth zero — this is where you find out what survived, and repair what didn&apos;t.
        </p>
      </div>

      {/* Due today — the daily driver */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: dueQueue.total > 0
            ? "linear-gradient(135deg, rgba(34,211,238,0.14), rgba(79,140,255,0.08) 60%, transparent), rgba(20,20,30,0.5)"
            : "linear-gradient(135deg, rgba(16,185,129,0.12), transparent 60%), rgba(20,20,30,0.5)",
          border: `1px solid ${dueQueue.total > 0 ? "rgba(34,211,238,0.3)" : "rgba(16,185,129,0.25)"}`,
        }}
      >
        {dueQueue.total > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,211,238,0.16)" }}>
                <CalendarClock className="w-7 h-7 text-[#22d3ee]" />
              </div>
              <div>
                <p className="eyebrow mb-0.5">Due today</p>
                <h2 className="text-2xl font-bold">
                  <span className="text-[#22d3ee] font-mono">{dueQueue.total}</span>{" "}
                  <span className="text-[var(--color-text-secondary)] font-medium">to review</span>
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {dueQueue.recallCount} recall{dueQueue.recallCount === 1 ? "" : "s"} · {dueQueue.coldCount} cold re-solve{dueQueue.coldCount === 1 ? "" : "s"} · sorted most-overdue first
                </p>
              </div>
            </div>
            <button
              onClick={() => setMode("review")}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)", boxShadow: "0 6px 20px -6px rgba(34,211,238,0.5)" }}
            >
              Start review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.16)" }}>
              <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-emerald)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Queue clear for today</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {dueQueue.nextDueAt
                  ? `Next review due ${format(new Date(dueQueue.nextDueAt), "MMM d")}.`
                  : "Solve problems to start building your review pipeline."}{" "}
                Recall keeps the bank solvent — a maintained day.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Retention hero — the honest headline */}
      <div
        className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.10), rgba(79,140,255,0.08) 55%, rgba(168,85,247,0.06)), rgba(20,20,30,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <RetentionRing percent={usablePct} retained={overview.retained} total={overview.solvedPlus} />
          <div className="flex-1">
            <p className="eyebrow mb-1">Usable problems</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              {overview.retained}{" "}
              <span className="text-[var(--color-text-secondary)] font-medium">
                of {overview.solvedPlus} solved are actually retained
              </span>
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl leading-relaxed">
              &quot;Retained&quot; = passed a notes-closed recall (Revised) or cold re-solved (Mastered).
              Interviews test the retained set, not the sheet percentage. Nobody asks how many you solved —
              they hand you one and watch.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: "rgba(79,140,255,0.14)", color: "#7ba9ff" }}>
                {overview.coreCount} CORE anchors
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-mono" style={{ background: "rgba(168,85,247,0.14)", color: "#c084fc" }}>
                {overview.supportCount} SUPPORT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning-mode alert */}
      {overview.learningMode.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(90deg, rgba(239,68,68,0.14), rgba(239,68,68,0.03))",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[var(--color-accent-red)]" />
            <h3 className="text-sm font-bold text-[var(--color-accent-red)]">
              Return to learning mode — {overview.learningMode.length} concept{overview.learningMode.length === 1 ? "" : "s"} broken
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Failed twice or more. Repeated failure means the concept, not the memory, is gone.
            Stop re-solving — rewatch, reread, work the editorial properly.
          </p>
          <div className="flex flex-wrap gap-2">
            {overview.learningMode.map((p) => (
              <Link
                key={p.id}
                href={`/patterns`}
                className="text-xs px-2.5 py-1 rounded-lg glass-row"
                title={`${p.patternName} · failed ${p.failCount}x`}
              >
                {p.title}
                <span className="ml-1.5 font-mono text-[var(--color-accent-red)]">×{p.failCount}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Damage Assessment */}
      <div className="section-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,211,238,0.14)" }}>
              <Stethoscope className="w-5 h-5 text-[#22d3ee]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Damage assessment</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 max-w-lg">
                One 40-minute pass: a 60-second recall on every solved problem, pattern by pattern.
                Mark pass or fail — <span className="text-[var(--color-text-secondary)]">fix nothing</span>.
                The output is a per-pattern failure map: your repair queue and your honest baseline.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMode("assessment")}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{
              background: overview.hasInProgress
                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                : "linear-gradient(90deg, #22d3ee, #4f8cff)",
              boxShadow: "0 6px 20px -6px rgba(34,211,238,0.5)",
            }}
          >
            {overview.hasInProgress ? <><RotateCcw className="w-4 h-4" /> Resume</> : overview.latest ? <><RotateCcw className="w-4 h-4" /> Re-run</> : <><Play className="w-4 h-4" /> Start assessment</>}
          </button>
        </div>

        {overview.latest ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow">Latest failure map</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--color-text-muted)]">Overall decay</span>
                <span className="font-mono font-bold" style={{ color: rateColor(overview.latest.overallFailRate) }}>
                  {overview.latest.overallFailRate}%
                </span>
              </div>
            </div>
            <div className="space-y-2.5">
              {overview.latest.rates.map((r) => (
                <div key={r.patternId} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-primary)] w-40 sm:w-48 shrink-0 truncate">
                    {r.patternName}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${r.failRate}%`, background: rateColor(r.failRate), boxShadow: `0 0 8px ${rateColor(r.failRate)}66` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold w-10 text-right" style={{ color: rateColor(r.failRate) }}>
                    {r.failRate}%
                  </span>
                  <span className="w-14 text-right shrink-0">
                    {r.delta === null ? (
                      <span className="text-[10px] text-[var(--color-text-muted)]">new</span>
                    ) : r.delta < 0 ? (
                      <span className="text-[10px] font-mono text-[var(--color-accent-emerald)] inline-flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />{r.delta}
                      </span>
                    ) : r.delta > 0 ? (
                      <span className="text-[10px] font-mono text-[var(--color-accent-red)] inline-flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />+{r.delta}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] inline-flex items-center gap-0.5">
                        <Minus className="w-3 h-3" />0
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono w-12 text-right shrink-0">
                    {r.failed}/{r.total}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-4">
              Sorted by decay. The delta column vs your previous assessment is the only progress metric
              that means anything — re-run every ~6 weeks.
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
            No assessment yet. Run one to map what&apos;s decayed — it turns a scary &quot;{usablePct}% retained&quot;
            into a concrete per-pattern repair plan.
          </div>
        )}
      </div>

      {/* Anchor list — the daily driver */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[var(--color-accent-blue)]" />
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">The anchor list</h2>
          <span className="eyebrow ml-1">your daily driver</span>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-4 max-w-2xl">
          Each pattern has 3–5 CORE problems that regenerate the rest. Own the CORE (cold re-solve level),
          keep SUPPORT at recall level. Read the name, say the insight out loud, then check yourself.
        </p>
        <div className="space-y-3">
          {anchors.map((p) => (
            <AnchorPatternBlock key={p.id} pattern={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnchorPatternBlock({ pattern }: { pattern: AnchorPattern }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="section-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[rgba(255,255,255,0.02)]"
      >
        <span className="text-xs font-mono font-bold text-[var(--color-accent-purple)]">
          #{String(pattern.order).padStart(2, "0")}
        </span>
        <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1">{pattern.name}</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(79,140,255,0.14)", color: "#7ba9ff" }}>
          {pattern.core.length} core
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.12)", color: "#c084fc" }}>
          {pattern.support.length} support
        </span>
        <span className={`text-[var(--color-text-muted)] transition-transform ${open ? "rotate-90" : ""}`}>›</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {[...pattern.core, ...pattern.support].map((pr) => (
            <AnchorRow key={pr.id} problem={pr} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnchorRow({
  problem,
}: {
  problem: { id: string; title: string; anchorInsight: string | null; status: string; tier?: string | null; difficulty: string | null; url: string; failCount: number };
}) {
  const [revealed, setRevealed] = useState(false);
  const isCore = (problem as { tier?: string | null }).tier === "CORE";
  return (
    <div className="glass-row rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
          style={
            isCore
              ? { background: "rgba(79,140,255,0.16)", color: "#7ba9ff" }
              : { background: "rgba(168,85,247,0.14)", color: "#c084fc" }
          }
        >
          {isCore ? "CORE" : "SUPPORT"}
        </span>
        <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1 truncate">{problem.title}</span>
        {problem.failCount >= 2 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 inline-flex items-center gap-0.5" style={{ background: "rgba(239,68,68,0.16)", color: "#f87171" }}>
            <Zap className="w-2.5 h-2.5" /> RELEARN
          </span>
        )}
        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded text-[var(--color-text-muted)] hover:text-white shrink-0">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      {problem.anchorInsight && (
        <div className="mt-2">
          {revealed ? (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{problem.anchorInsight}</p>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="text-[11px] font-medium text-[var(--color-accent-blue)] hover:underline"
            >
              Say it out loud, then reveal the insight →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RetentionRing({ percent, retained, total }: { percent: number; retained: number; total: number }) {
  const size = 130;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = percent >= 60 ? "#10b981" : percent >= 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * (percent / 100)} ${circ}`}
          style={{ filter: `drop-shadow(0 0 10px ${color}80)`, transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>
          {percent}<span className="text-lg">%</span>
        </span>
        <span className="eyebrow mt-0.5">retained</span>
        <span className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">{retained}/{total}</span>
      </div>
    </div>
  );
}
