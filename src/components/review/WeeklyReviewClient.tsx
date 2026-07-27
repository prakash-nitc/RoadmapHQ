"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  RotateCcw,
  Calendar,
  ArrowRight,
  Flame,
  AlertTriangle,
} from "lucide-react";

interface ReviewData {
  thisWeekStart: string;
  thisWeekEnd: string;
  isWeekEnded: boolean;
  daysIntoWeek: number;
  target: number;

  problemsThis: number;
  problemsLast: number;
  problemsDelta: number;
  videosThis: number;
  videosLast: number;
  videosDelta: number;
  studyDaysThis: number;
  studyDaysLast: number;

  revisionsCompleted: number;
  revisionsSkipped: number;

  perDayProblems: { date: string; label: string; count: number }[];
  bestDay: { date: string; label: string; count: number };
  topPattern: { id: string; name: string; count: number } | null;
  weakest: { id: string; name: string; mastery: number; solved: number; total: number }[];
  difficultyThis: { EASY: number; MEDIUM: number; HARD: number };

  avgPerDay: number;
  hitTargetDays: number;
  goalPctThisWeek: number;
  targetProblems: number;
  todayMissionComplete: boolean;
}

export function WeeklyReviewClient({ data }: { data: ReviewData }) {
  const targetForWeek = data.targetProblems * 7;
  const onPace = data.problemsThis >= data.targetProblems * data.daysIntoWeek;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
          {data.isWeekEnded ? "The week, sealed." : "Week so far"}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Week of {data.thisWeekStart}–{data.thisWeekEnd}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
          {data.isWeekEnded
            ? "Read what worked, fix what slipped, set next week's intent."
            : `Day ${data.daysIntoWeek} of 7 · stats update live as the week progresses.`}
        </p>
      </div>

      {/* Hero verdict — single-glance answer */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: onPace
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 211, 238, 0.08) 60%, transparent)"
            : "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.06) 60%, transparent)",
          border: `1px solid ${
            onPace ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"
          }`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.18em] font-semibold mb-1"
              style={{
                color: onPace
                  ? "var(--color-accent-emerald)"
                  : "var(--color-accent-amber)",
              }}
            >
              {onPace ? "Strong week" : "Soft week"}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              {data.problemsThis}{" "}
              <span className="text-[var(--color-text-secondary)] font-medium">
                problems solved
              </span>
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {data.avgPerDay}/day average · target {data.targetProblems}/day ·{" "}
              {data.hitTargetDays}/7 days hit
            </p>
          </div>

          {/* Goal ring */}
          <div className="flex items-center justify-center md:justify-end">
            <GoalRing
              percent={Math.min(data.goalPctThisWeek, 100)}
              solved={data.problemsThis}
              targetForWeek={targetForWeek}
              onPace={onPace}
            />
          </div>
        </div>
      </div>

      {/* Comparison strip — this week vs last */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CompareCard
          icon={Target}
          label="Problems"
          thisWeek={data.problemsThis}
          lastWeek={data.problemsLast}
          delta={data.problemsDelta}
          color="var(--color-accent-blue)"
        />
        <CompareCard
          icon={Calendar}
          label="Study days"
          thisWeek={data.studyDaysThis}
          lastWeek={data.studyDaysLast}
          delta={data.studyDaysThis - data.studyDaysLast}
          color="var(--color-accent-emerald)"
          suffix="/7"
        />
        <CompareCard
          icon={Flame}
          label="Videos"
          thisWeek={data.videosThis}
          lastWeek={data.videosLast}
          delta={data.videosDelta}
          color="var(--color-accent-purple)"
        />
      </div>

      {/* Per-day bar chart */}
      <div className="section-card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Problems solved per day
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Bars vs your daily target of {data.targetProblems}
            </p>
          </div>
          {data.bestDay.count > 0 && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
                Best day
              </p>
              <p className="text-lg font-bold font-mono text-[var(--color-accent-emerald)]">
                {data.bestDay.count}{" "}
                <span className="text-xs text-[var(--color-text-muted)]">
                  · {data.bestDay.label}
                </span>
              </p>
            </div>
          )}
        </div>
        <DayBars
          days={data.perDayProblems}
          target={data.targetProblems}
        />
      </div>

      {/* Wins + Slips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-[var(--color-accent-emerald)]" />
            <h3 className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-accent-emerald)]">
              What you crushed
            </h3>
          </div>
          {data.topPattern ? (
            <Link
              href={`/patterns/${data.topPattern.id}`}
              className="block group"
            >
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Most movement
              </p>
              <p className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-emerald)] transition-colors">
                {data.topPattern.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {data.topPattern.count} problems solved here this week
              </p>
            </Link>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] py-3">
              No solves yet this week. Open the problem queue to start.
            </p>
          )}

          {(data.difficultyThis.EASY +
            data.difficultyThis.MEDIUM +
            data.difficultyThis.HARD) >
            0 && (
            <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold mb-2">
                Difficulty mix
              </p>
              <div className="flex items-center gap-4">
                <DiffPill
                  label="Easy"
                  count={data.difficultyThis.EASY}
                  color="var(--color-accent-emerald)"
                />
                <DiffPill
                  label="Medium"
                  count={data.difficultyThis.MEDIUM}
                  color="var(--color-accent-amber)"
                />
                <DiffPill
                  label="Hard"
                  count={data.difficultyThis.HARD}
                  color="var(--color-accent-red)"
                />
              </div>
            </div>
          )}
        </div>

        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[var(--color-accent-amber)]" />
            <h3 className="text-xs uppercase tracking-[0.18em] font-bold text-[var(--color-accent-amber)]">
              What slipped
            </h3>
          </div>

          <div className="space-y-3">
            {(() => {
              // Only days that have actually happened can be "missed" or
              // "below target" — future days in the week aren't failures yet.
              const elapsed = Math.min(Math.max(data.daysIntoWeek, 1), 7);
              const missed = Math.max(elapsed - data.studyDaysThis, 0);
              const belowTarget = Math.max(elapsed - data.hitTargetDays, 0);
              return (
                <>
                  <SlipRow
                    label="Days missed"
                    value={`${missed}/${elapsed}`}
                    hint={
                      missed === 0
                        ? elapsed === 7
                          ? "Perfect attendance ✨"
                          : "Spotless so far — keep it up"
                        : `${data.studyDaysThis} of ${elapsed} days active`
                    }
                    good={missed === 0}
                  />
                  <SlipRow
                    label="Revisions skipped"
                    value={String(data.revisionsSkipped)}
                    hint={
                      data.revisionsSkipped === 0
                        ? "Queue stayed clean"
                        : `${data.revisionsCompleted} completed · ${data.revisionsSkipped} skipped`
                    }
                    good={data.revisionsSkipped === 0}
                  />
                  <SlipRow
                    label="Below target days"
                    value={`${belowTarget}/${elapsed}`}
                    hint={
                      belowTarget === 0
                        ? "Every day hit target so far"
                        : `${data.hitTargetDays} of ${elapsed} days hit ${data.targetProblems}+`
                    }
                    good={belowTarget === 0}
                  />
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Next week prompt */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(79, 140, 255, 0.12), rgba(168, 85, 247, 0.08) 60%, transparent)",
          border: "1px solid rgba(79, 140, 255, 0.25)",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(79, 140, 255, 0.2)" }}
          >
            <Target className="w-5 h-5 text-[var(--color-accent-blue)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
              Next week
            </p>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5 mb-3">
              Focus on weak patterns to climb the leaderboard
            </h3>
            {data.weakest.length > 0 ? (
              <div className="space-y-2">
                {data.weakest.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/patterns/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-primary)]/40 border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors group"
                  >
                    <span className="text-xs font-mono font-bold text-[var(--color-accent-blue)] w-5 text-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-blue)] transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {p.solved}/{p.total} solved · {p.mastery}% mastery
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">
                Solve a few problems first to surface weak spots.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/problems"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
              >
                Open problem queue
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                href="/goals"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
              >
                Adjust target
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalRing({
  percent,
  solved,
  targetForWeek,
  onPace,
}: {
  percent: number;
  solved: number;
  targetForWeek: number;
  onPace: boolean;
}) {
  const size = 130;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = onPace ? "var(--color-accent-emerald)" : "var(--color-accent-amber)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * (percent / 100)} ${circ}`}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`,
            transition: "stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold font-mono leading-none"
          style={{ color }}
        >
          {percent}
          <span className="text-base text-[var(--color-text-muted)]">%</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] mt-1 font-semibold">
          of weekly goal
        </span>
        <span className="text-[9px] font-mono text-[var(--color-text-muted)] mt-0.5">
          {solved}/{targetForWeek}
        </span>
      </div>
    </div>
  );
}

function CompareCard({
  icon: Icon,
  label,
  thisWeek,
  lastWeek,
  delta,
  color,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  thisWeek: number;
  lastWeek: number;
  delta: number;
  color: string;
  suffix?: string;
}) {
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : null;
  const deltaColor =
    delta > 0
      ? "var(--color-accent-emerald)"
      : delta < 0
      ? "var(--color-accent-red)"
      : "var(--color-text-muted)";

  return (
    <div className="section-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: color + "22" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold font-mono leading-none" style={{ color }}>
          {thisWeek}
        </span>
        {suffix && (
          <span className="text-sm text-[var(--color-text-muted)] font-mono">
            {suffix}
          </span>
        )}
      </div>
      <p
        className="text-[11px] mt-2 flex items-center gap-1 font-mono"
        style={{ color: deltaColor }}
      >
        {DeltaIcon && <DeltaIcon className="w-3 h-3" />}
        {delta > 0 ? `+${delta}` : delta}{" "}
        <span className="text-[var(--color-text-muted)] ml-0.5">
          vs last week ({lastWeek})
        </span>
      </p>
    </div>
  );
}

function DayBars({
  days,
  target,
}: {
  days: { date: string; label: string; count: number }[];
  target: number;
}) {
  // Headroom above the target so a target-hitting bar doesn't touch the ceiling.
  const max = Math.max(target * 1.25, ...days.map((d) => d.count), target, 3);
  const targetPct = (target / max) * 100;
  const todayKey = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="relative pt-2">
      {/* Target reference line, spanning the whole chart */}
      <div className="relative h-36">
        <div
          className="absolute left-0 right-0 flex items-center gap-2 pointer-events-none z-10"
          style={{ bottom: `${targetPct}%` }}
        >
          <div className="flex-1 border-t border-dashed border-[var(--color-accent-amber)]/40" />
          <span className="text-[9px] font-mono text-[var(--color-accent-amber)]/70 shrink-0">
            target {target}
          </span>
        </div>

        {/* Bars sit on a shared baseline */}
        <div className="absolute inset-0 flex items-end gap-2.5">
          {days.map((d) => {
            const heightPct = Math.max((d.count / max) * 100, d.count > 0 ? 6 : 0);
            const hitTarget = d.count >= target && d.count > 0;
            const isToday = d.date === todayKey;
            return (
              <div key={d.date} className="flex-1 h-full flex flex-col justify-end">
                {/* Faint full-height track so every day is visible */}
                <div className="relative w-full h-full flex items-end rounded-md bg-[rgba(255,255,255,0.025)] overflow-hidden">
                  {isToday && (
                    <div className="absolute inset-0 bg-[var(--color-accent-blue)]/[0.06] ring-1 ring-inset ring-[var(--color-accent-blue)]/25 rounded-md" />
                  )}
                  <div
                    className="relative w-full rounded-md transition-all duration-700 ease-out"
                    style={{
                      height: `${heightPct}%`,
                      background: hitTarget
                        ? "linear-gradient(180deg, #34d399, var(--color-accent-emerald))"
                        : d.count > 0
                        ? "linear-gradient(180deg, #60a5fa, var(--color-accent-blue))"
                        : "transparent",
                      boxShadow: d.count > 0
                        ? `0 0 12px ${hitTarget ? "rgba(16,185,129,0.45)" : "rgba(79,140,255,0.4)"}`
                        : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels row */}
      <div className="flex items-start gap-2.5 mt-2">
        {days.map((d) => {
          const isToday = d.date === todayKey;
          return (
            <div key={d.date} className="flex-1 text-center">
              <div
                className={`text-sm font-mono font-bold ${
                  d.count > 0
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {d.count}
              </div>
              <div
                className={`text-[10px] uppercase tracking-widest font-semibold ${
                  isToday
                    ? "text-[var(--color-accent-blue)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiffPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-base font-bold font-mono" style={{ color }}>
        {count}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">
        {label}
      </span>
    </div>
  );
}

function SlipRow({
  label,
  value,
  hint,
  good,
}: {
  label: string;
  value: string;
  hint: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--color-bg-primary)]/40 border border-[var(--color-border-subtle)]">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] truncate">{hint}</p>
      </div>
      <span
        className="text-lg font-bold font-mono shrink-0"
        style={{
          color: good
            ? "var(--color-accent-emerald)"
            : "var(--color-accent-amber)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
