"use client";

import Link from "next/link";
import { Flame, Target, CalendarClock, Sparkles } from "lucide-react";

interface MissionBriefingProps {
  greeting: string;
  dayNumber: number;
  todayDate: string;
  solvedProblems: number;
  totalProblems: number;
  watchedVideos: number;
  totalVideos: number;
  overallReadiness: number;
  currentStreak: number;
  longestStreak: number;
  projectedDate: string;
  problemsPerDay: number;
  targetDate: string | null;
}

export function MissionBriefing(props: MissionBriefingProps) {
  const {
    greeting,
    dayNumber,
    todayDate,
    solvedProblems,
    totalProblems,
    watchedVideos,
    totalVideos,
    overallReadiness,
    currentStreak,
    longestStreak,
    projectedDate,
    problemsPerDay,
    targetDate,
  } = props;

  const problemsPct =
    totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
  const videosPct =
    totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;
  const remaining = Math.max(totalProblems - solvedProblems, 0);

  return (
    <div className="space-y-7">
      {/* Hero panel */}
      <div className="briefing-hero relative overflow-hidden rounded-2xl">
        {/* Decorative gradient orbs */}
        <div className="briefing-orb briefing-orb-1" aria-hidden />
        <div className="briefing-orb briefing-orb-2" aria-hidden />

        <div className="relative p-8 md:p-12">
          {/* Top row: greeting + date */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-12">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
                {greeting}, Prakash
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-1 leading-tight">
                <span className="gradient-text-animate bg-gradient-to-r from-[#f472b6] via-[#a855f7] via-[#4f8cff] to-[#f472b6] bg-clip-text text-transparent">
                  Day {dayNumber}
                </span>{" "}
                <span className="text-[var(--color-text-primary)]">
                  of your mission
                </span>
              </h1>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
                Today
              </p>
              <p className="text-sm font-mono text-[var(--color-text-primary)] mt-1">
                {todayDate}
              </p>
            </div>
          </div>

          {/* Center: ring + 3 headline stat cards.
              items-stretch + h-full on cards ensures cards match ring height. */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_1fr] gap-6 md:gap-8 items-stretch">
            <div className="flex justify-center md:justify-start items-center md:px-2">
              <ReadinessRing
                percent={overallReadiness}
                problemsPct={problemsPct}
                videosPct={videosPct}
              />
            </div>

            <HeadlineStat
              label="Problems solved"
              value={solvedProblems}
              total={totalProblems}
              color="#22d3ee"
              accent="emerald"
            />
            <HeadlineStat
              label="Videos watched"
              value={watchedVideos}
              total={totalVideos}
              color="var(--color-accent-purple)"
              accent="purple"
            />
            <HeadlineStat
              label="Remaining"
              value={remaining}
              suffix="problems"
              color="var(--color-accent-amber)"
              accent="amber"
            />
          </div>
        </div>
      </div>

      {/* Footer chip row — separate cards below the hero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
        <FooterChip
          icon={Flame}
          label="Current streak"
          value={`${currentStreak} ${currentStreak === 1 ? "day" : "days"}`}
          subtext={
            longestStreak > currentStreak
              ? `Best: ${longestStreak}d`
              : "Personal best!"
          }
          color="var(--color-accent-amber)"
        />
        <FooterChip
          icon={CalendarClock}
          label="Projected finish"
          value={projectedDate}
          subtext={
            problemsPerDay > 0
              ? `${problemsPerDay.toFixed(1)}/day observed · target-aware`
              : "Set a target to project"
          }
          color="var(--color-accent-blue)"
        />
        <FooterChip
          icon={Target}
          label="Your goal"
          value={targetDate ?? "Not set"}
          subtext={
            targetDate ? "Tap to adjust" : "Set a target date"
          }
          color="var(--color-accent-emerald)"
          href="/goals"
        />
      </div>
    </div>
  );
}

function ReadinessRing({
  percent,
  problemsPct,
  videosPct,
}: {
  percent: number;
  problemsPct: number;
  videosPct: number;
}) {
  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {/* Videos arc (outer thin ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r - stroke}
          fill="none"
          stroke="var(--color-accent-purple)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={`${(2 * Math.PI * (r - stroke)) * (videosPct / 100)} ${2 * Math.PI * (r - stroke)}`}
          className="progress-bar-fill"
          opacity={0.6}
        />
        {/* Problems arc — cyan→blue */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * (problemsPct / 100)} ${circ}`}
          className="progress-bar-fill"
          style={{ filter: "drop-shadow(0 0 14px rgba(34, 211, 238, 0.5))" }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#4f8cff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold font-mono leading-none stat-value text-[#22d3ee]">
          {percent}
          <span className="text-xl text-[var(--color-text-muted)]">%</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] mt-2 font-medium">
          Placement
        </div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-medium">
          Ready
        </div>
      </div>
    </div>
  );
}

function HeadlineStat({
  label,
  value,
  total,
  suffix,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  suffix?: string;
  color: string;
  accent: "emerald" | "purple" | "amber";
}) {
  const pct = total && total > 0 ? Math.round((value / total) * 100) : 100;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col h-full min-h-[160px]"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border-subtle)",
      }}
    >
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold leading-relaxed">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5 mt-4">
          <span
            className="text-3xl md:text-4xl font-bold font-mono leading-none stat-value"
            style={{ color }}
          >
            {value}
          </span>
          {total !== undefined && (
            <span className="text-base text-[var(--color-text-muted)] font-mono leading-none">
              / {total}
            </span>
          )}
          {suffix && (
            <span className="text-xs text-[var(--color-text-muted)] ml-1 leading-none">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* In-flow progress bar — not absolute, so border-radius can't clip it */}
      <div className="mt-5 h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function FooterChip({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  href,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  subtext: string;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="section-card p-6 flex items-center gap-4 hover:bg-[var(--color-bg-card-hover)] transition-colors h-full">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + "22" }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
          {label}
        </div>
        <div
          className="text-lg font-bold font-mono truncate mt-1.5"
          style={{ color }}
          title={value}
        >
          {value}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] truncate mt-1">
          {subtext}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
