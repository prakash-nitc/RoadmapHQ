"use client";

import {
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Trophy,
} from "lucide-react";

interface RealityCheckProps {
  daysRemaining: number;
  baseline: number;
  solvedProblems: number;
  totalProblems: number;
  problemsPerDay: number;
  targetPerDay: number;
  projectedAtCurrentPace: number;
  projectedAtTargetPace: number;
  neededPerDay: number;
  verdict: "on-track" | "hit-target" | "behind" | "no-date";
}

export function RealityCheck(props: RealityCheckProps) {
  if (props.verdict === "no-date") {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(79, 140, 255, 0.04))",
          border: "1px solid rgba(168, 85, 247, 0.3)",
        }}
      >
        <p className="text-sm text-[var(--color-text-secondary)]">
          Set your placement date above to unlock the reality check.
        </p>
      </div>
    );
  }

  const config = {
    "on-track": {
      title: "Reality check: you're on pace",
      blurb: `At your current rate of ${props.problemsPerDay.toFixed(1)}/day you'll be interview-ready before the season. Keep it steady.`,
      icon: CheckCircle2,
      color: "var(--color-accent-emerald)",
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(16, 185, 129, 0.03))",
      border: "rgba(16, 185, 129, 0.32)",
    },
    "hit-target": {
      title: "Reality check: target works, current pace doesn't",
      blurb: `Your current ${props.problemsPerDay.toFixed(1)}/day projects to ${props.projectedAtCurrentPace} — short of the ${props.baseline} baseline. Hitting your ${props.targetPerDay}/day target gets you to ${props.projectedAtTargetPace}. Show up daily and the math works.`,
      icon: Target,
      color: "var(--color-accent-blue)",
      bg: "linear-gradient(135deg, rgba(79, 140, 255, 0.14), rgba(79, 140, 255, 0.03))",
      border: "rgba(79, 140, 255, 0.32)",
    },
    behind: {
      title: "Reality check: even your target won't make it",
      blurb: `Hitting your daily target every single day still leaves you at ${props.projectedAtTargetPace} — under the ${props.baseline} baseline. You need ${props.neededPerDay}/day to clear it. Raise the target or extend the date.`,
      icon: AlertTriangle,
      color: "var(--color-accent-red)",
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.14), rgba(239, 68, 68, 0.03))",
      border: "rgba(239, 68, 68, 0.35)",
    },
  }[props.verdict];

  const Icon = config.icon;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: config.color }} />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            {config.title}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
            {config.blurb}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <ScenarioTile
          label="At current pace"
          subLabel={`${props.problemsPerDay.toFixed(1)}/day`}
          projected={props.projectedAtCurrentPace}
          baseline={props.baseline}
          icon={TrendingUp}
          isAchieved={props.projectedAtCurrentPace >= props.baseline}
        />
        <ScenarioTile
          label="At target pace"
          subLabel={`${props.targetPerDay}/day`}
          projected={props.projectedAtTargetPace}
          baseline={props.baseline}
          icon={Target}
          isAchieved={props.projectedAtTargetPace >= props.baseline}
        />
        <ScenarioTile
          label="Needed pace"
          subLabel={`${props.neededPerDay}/day`}
          projected={props.baseline}
          baseline={props.baseline}
          icon={Trophy}
          isAchieved
          isNeed
        />
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)] grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
            Days left
          </p>
          <p className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
            {props.daysRemaining}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
            Solved
          </p>
          <p className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
            {props.solvedProblems}/{props.totalProblems}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
            Baseline
          </p>
          <p className="text-lg font-bold font-mono text-[var(--color-text-primary)] mt-0.5">
            {props.baseline}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScenarioTile({
  label,
  subLabel,
  projected,
  baseline,
  icon: Icon,
  isAchieved,
  isNeed = false,
}: {
  label: string;
  subLabel: string;
  projected: number;
  baseline: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isAchieved: boolean;
  isNeed?: boolean;
}) {
  const color = isNeed
    ? "var(--color-accent-purple)"
    : isAchieved
    ? "var(--color-accent-emerald)"
    : "var(--color-accent-red)";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--color-bg-primary)",
        border: `1px solid ${color}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
          {label}
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] font-mono mb-1">
        {subLabel}
      </p>
      <p
        className="text-2xl font-bold font-mono leading-none"
        style={{ color }}
      >
        {projected}
      </p>
      {!isNeed && (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
          {isAchieved ? `Clears baseline` : `Short by ${baseline - projected}`}
        </p>
      )}
      {isNeed && (
        <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
          To clear {baseline}
        </p>
      )}
    </div>
  );
}
