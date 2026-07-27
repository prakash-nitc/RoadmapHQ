"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  Code2,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Flame,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

interface AnalyticsData {
  problemsThisWeek: number;
  problemsLastWeek: number;
  weekDelta: number;
  consistencyScore: number;
  studyDaysInLast30: number;
  bestDay: { count: number; date: string };
  currentStreak: number;
  longestStreak: number;
  dailyAverage: number;
  daysActive: number;
  totalSolved: number;

  weeklyTrend: { label: string; count: number; isCurrent: boolean }[];
  bestWeek: { label: string; count: number; isCurrent: boolean };
  momentumDelta: number;

  dailyProblems: { date: string; label: string; problems: number; videos: number }[];
  difficultyCounts: { EASY: number; MEDIUM: number; HARD: number; UNKNOWN: number };

  strongest: { id: string; name: string; mastery: number; solved: number; total: number }[];
  weakest: { id: string; name: string; mastery: number; solved: number; total: number }[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#10b981",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
  UNKNOWN: "#6b7280",
};

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const totalSolvedRated =
    data.difficultyCounts.EASY +
    data.difficultyCounts.MEDIUM +
    data.difficultyCounts.HARD +
    data.difficultyCounts.UNKNOWN;

  const difficultyPie = [
    { name: "Easy", value: data.difficultyCounts.EASY, color: DIFFICULTY_COLORS.EASY },
    { name: "Medium", value: data.difficultyCounts.MEDIUM, color: DIFFICULTY_COLORS.MEDIUM },
    { name: "Hard", value: data.difficultyCounts.HARD, color: DIFFICULTY_COLORS.HARD },
    ...(data.difficultyCounts.UNKNOWN > 0
      ? [{ name: "Other", value: data.difficultyCounts.UNKNOWN, color: DIFFICULTY_COLORS.UNKNOWN }]
      : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
          Your study patterns at a glance
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
          Habits, difficulty mix, and where to focus next.
        </p>
      </div>

      {/* Top stat row — 5 cards in a balanced grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Code2}
          label="Problems this week"
          value={String(data.problemsThisWeek)}
          color="#22d3ee"
          delta={data.weekDelta}
          deltaSuffix={`vs last week`}
        />
        <StatCard
          icon={Activity}
          label="Consistency (30d)"
          value={`${data.consistencyScore}%`}
          color="var(--color-accent-emerald)"
          hint={`${data.studyDaysInLast30} of 30 days`}
        />
        <StatCard
          icon={Award}
          label="Best day ever"
          value={String(data.bestDay.count)}
          color="var(--color-accent-purple)"
          hint={data.bestDay.date}
        />
        <StatCard
          icon={Flame}
          label="Current streak"
          value={`${data.currentStreak}d`}
          color="var(--color-accent-amber)"
        />
        <StatCard
          icon={Trophy}
          label="Longest streak"
          value={`${data.longestStreak}d`}
          color="var(--color-accent-purple)"
        />
      </div>

      {/* Weekly momentum — the progress / recovery arc */}
      <WeeklyMomentum
        weeklyTrend={data.weeklyTrend}
        bestWeek={data.bestWeek}
        momentumDelta={data.momentumDelta}
        problemsThisWeek={data.problemsThisWeek}
        problemsLastWeek={data.problemsLastWeek}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Problems per day — 30d (2 cols on lg) */}
        <div className="section-card p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Problems solved per day
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Last 30 days · {data.dailyAverage}/day average over {data.daysActive} active days
              </p>
            </div>
          </div>
          {data.dailyProblems.some((d) => d.problems > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.dailyProblems} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161f",
                    border: "1px solid #2a2a3a",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                  cursor={{ fill: "rgba(79, 140, 255, 0.08)" }}
                />
                <Bar
                  dataKey="problems"
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-[var(--color-text-muted)]">
              Solve a problem to start the chart.
            </div>
          )}
        </div>

        {/* Difficulty mix — donut */}
        <div className="section-card p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Difficulty mix
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              The interview signal in one chart.
            </p>
          </div>
          {totalSolvedRated > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={difficultyPie}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {difficultyPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#16161f",
                      border: "1px solid #2a2a3a",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full grid grid-cols-3 gap-2 mt-3">
                {difficultyPie
                  .filter((d) => d.value > 0 || ["Easy", "Medium", "Hard"].includes(d.name))
                  .slice(0, 3)
                  .map((d) => (
                    <div key={d.name} className="text-center">
                      <div
                        className="text-base font-bold font-mono"
                        style={{ color: d.color }}
                      >
                        {d.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">
                        {d.name}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-text-muted)] py-8 text-center">
              Solve some problems to see your difficulty split.
            </div>
          )}
        </div>
      </div>

      {/* Pattern leaderboard */}
      <div className="section-card p-5">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              Pattern leaderboard
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Where you&apos;re strong, where you need work.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeaderboardColumn
            title="Strongest"
            icon={Trophy}
            color="var(--color-accent-emerald)"
            patterns={data.strongest}
            emptyHint="Build mastery to climb the board."
          />
          <LeaderboardColumn
            title="Needs work"
            icon={TrendingDown}
            color="var(--color-accent-amber)"
            patterns={data.weakest}
            emptyHint="No data yet — start solving."
          />
        </div>
      </div>
    </div>
  );
}

function WeeklyMomentum({
  weeklyTrend,
  bestWeek,
  momentumDelta,
  problemsThisWeek,
  problemsLastWeek,
}: {
  weeklyTrend: { label: string; count: number; isCurrent: boolean }[];
  bestWeek: { label: string; count: number; isCurrent: boolean };
  momentumDelta: number;
  problemsThisWeek: number;
  problemsLastWeek: number;
}) {
  const max = Math.max(...weeklyTrend.map((w) => w.count), 1);
  const rising = momentumDelta > 0;
  const flat = momentumDelta === 0;

  // Encouraging headline that reads the shape of the recent trend.
  const headline = (() => {
    if (problemsThisWeek > problemsLastWeek && problemsLastWeek === 0)
      return "Back in the game — great comeback week 💪";
    if (rising) return "You're accelerating — momentum is on your side";
    if (flat) return "Holding steady — consistency compounds";
    return "Slower week — a strong one resets the trend";
  })();

  return (
    <div className="section-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Weekly momentum
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {headline}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="eyebrow">Best week</p>
            <p className="text-sm font-bold font-mono text-[var(--color-accent-emerald)]">
              {bestWeek.count}{" "}
              <span className="text-[var(--color-text-muted)] font-normal">· {bestWeek.label}</span>
            </p>
          </div>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-md"
            style={{
              background: rising
                ? "rgba(16,185,129,0.12)"
                : flat
                ? "rgba(255,255,255,0.04)"
                : "rgba(245,158,11,0.12)",
            }}
          >
            {rising ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-accent-emerald)]" />
            ) : flat ? (
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
            )}
            <span
              className="text-xs font-mono font-bold"
              style={{
                color: rising
                  ? "var(--color-accent-emerald)"
                  : flat
                  ? "var(--color-text-muted)"
                  : "var(--color-accent-amber)",
              }}
            >
              {momentumDelta > 0 ? `+${momentumDelta}` : momentumDelta}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">vs 4-wk avg</span>
          </div>
        </div>
      </div>

      {/* 8-week bars */}
      <div className="flex items-end gap-2 sm:gap-3 h-28">
        {weeklyTrend.map((w) => {
          const heightPct = Math.max((w.count / max) * 100, w.count > 0 ? 8 : 2);
          return (
            <div key={w.label} className="flex-1 h-full flex flex-col justify-end">
              <div className="relative w-full h-full flex items-end rounded-md bg-[rgba(255,255,255,0.025)] overflow-hidden">
                <div
                  className="w-full rounded-md transition-all duration-700 ease-out"
                  style={{
                    height: `${heightPct}%`,
                    background: w.isCurrent
                      ? "linear-gradient(180deg, #67e8f9, #22d3ee)"
                      : w.count > 0
                      ? "linear-gradient(180deg, #4f8cff, #3b6fd4)"
                      : "rgba(255,255,255,0.04)",
                    boxShadow: w.isCurrent
                      ? "0 0 14px rgba(34,211,238,0.5)"
                      : w.count > 0
                      ? "0 0 8px rgba(79,140,255,0.3)"
                      : "none",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-2 sm:gap-3 mt-2">
        {weeklyTrend.map((w) => (
          <div key={w.label} className="flex-1 text-center">
            <div
              className={`text-xs font-mono font-bold ${
                w.isCurrent
                  ? "text-[#22d3ee]"
                  : w.count > 0
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {w.count}
            </div>
            <div
              className={`text-[9px] font-semibold ${
                w.isCurrent ? "text-[#22d3ee]" : "text-[var(--color-text-muted)]"
              }`}
            >
              {w.isCurrent ? "This wk" : w.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  hint,
  delta,
  deltaSuffix,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  color: string;
  hint?: string;
  delta?: number;
  deltaSuffix?: string;
}) {
  const showDelta = delta !== undefined && delta !== null;
  const DeltaIcon =
    delta && delta > 0 ? ArrowUpRight : delta && delta < 0 ? ArrowDownRight : null;
  const deltaColor =
    delta && delta > 0
      ? "var(--color-accent-emerald)"
      : delta && delta < 0
      ? "var(--color-accent-red)"
      : "var(--color-text-muted)";

  return (
    <div className="section-card p-4 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + "22" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.18em] font-semibold truncate">
          {label}
        </span>
      </div>
      <div className="flex-1">
        <p
          className="text-2xl font-bold font-mono leading-none truncate"
          style={{ color }}
          title={value}
        >
          {value}
        </p>
        {showDelta && (
          <p
            className="text-[10px] mt-2 flex items-center gap-0.5 font-mono"
            style={{ color: deltaColor }}
          >
            {DeltaIcon && <DeltaIcon className="w-3 h-3" />}
            {delta! > 0 ? `+${delta}` : delta}{" "}
            <span className="text-[var(--color-text-muted)] ml-0.5">{deltaSuffix}</span>
          </p>
        )}
        {hint && !showDelta && (
          <p className="text-[10px] text-[var(--color-text-muted)] mt-2 truncate">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

function LeaderboardColumn({
  title,
  icon: Icon,
  color,
  patterns,
  emptyHint,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  patterns: { id: string; name: string; mastery: number; solved: number; total: number }[];
  emptyHint: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <h3
          className="text-xs uppercase tracking-[0.18em] font-bold"
          style={{ color }}
        >
          {title}
        </h3>
      </div>
      {patterns.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-2">{emptyHint}</p>
      ) : (
        <div className="space-y-2">
          {patterns.map((p, idx) => (
            <Link
              key={p.id}
              href={`/patterns/${p.id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-primary)]/40 border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] transition-colors group"
            >
              <span
                className="text-xs font-mono font-bold w-5 text-center shrink-0"
                style={{ color }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent-blue)] transition-colors">
                  {p.name}
                </p>
                <div className="mt-1.5 h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${p.mastery}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}66`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-sm font-bold font-mono leading-none"
                  style={{ color }}
                >
                  {p.mastery}%
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono">
                  {p.solved}/{p.total}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
