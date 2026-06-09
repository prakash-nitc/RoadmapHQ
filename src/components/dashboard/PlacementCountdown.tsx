import Link from "next/link";
import { Hourglass, Flame, Target, ArrowRight } from "lucide-react";

interface PlacementCountdownProps {
  daysRemaining: number | null;
  isSet: boolean;
  baseline: number;
  projectedAtCurrentPace: number;
  projectedAtTargetPace: number;
  neededPerDay: number;
  verdict: "on-track" | "hit-target" | "behind" | "no-date";
  problemsPerDay: number;
  targetPerDay: number;
}

// Color tiers — the further out, the calmer; the closer, the louder.
function styleForDays(days: number) {
  if (days > 120) {
    return {
      label: "Placement season",
      bg: "linear-gradient(90deg, rgba(79, 140, 255, 0.18), rgba(79, 140, 255, 0.03))",
      border: "rgba(79, 140, 255, 0.4)",
      accent: "var(--color-accent-blue)",
      icon: Target,
    };
  }
  if (days > 60) {
    return {
      label: "Closing in",
      bg: "linear-gradient(90deg, rgba(245, 158, 11, 0.22), rgba(245, 158, 11, 0.04))",
      border: "rgba(245, 158, 11, 0.45)",
      accent: "var(--color-accent-amber)",
      icon: Hourglass,
    };
  }
  if (days > 0) {
    return {
      label: "Time's almost up",
      bg: "linear-gradient(90deg, rgba(239, 68, 68, 0.28), rgba(239, 68, 68, 0.06))",
      border: "rgba(239, 68, 68, 0.55)",
      accent: "var(--color-accent-red)",
      icon: Flame,
    };
  }
  return {
    label: "Placement season open",
    bg: "linear-gradient(90deg, rgba(168, 85, 247, 0.22), rgba(168, 85, 247, 0.04))",
    border: "rgba(168, 85, 247, 0.45)",
    accent: "var(--color-accent-purple)",
    icon: Flame,
  };
}

export function PlacementCountdown(props: PlacementCountdownProps) {
  // CTA banner if no date set — encourages user to set it.
  if (!props.isSet || props.daysRemaining === null) {
    return (
      <Link
        href="/goals"
        className="block rounded-2xl px-5 py-4 group"
        style={{
          background:
            "linear-gradient(90deg, rgba(168, 85, 247, 0.15), rgba(79, 140, 255, 0.04))",
          border: "1px solid rgba(168, 85, 247, 0.35)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(168, 85, 247, 0.22)" }}
          >
            <Hourglass className="w-5 h-5 text-[var(--color-accent-purple)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-accent-purple)]">
              Set your placement date
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">
              Unlock countdown, daily pressure, and reality-check math.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-purple)] transition-colors" />
        </div>
      </Link>
    );
  }

  const days = props.daysRemaining;
  const style = styleForDays(days);
  const Icon = style.icon;

  const subline = (() => {
    if (props.verdict === "on-track") {
      return `On pace: ${props.problemsPerDay.toFixed(1)}/day → ${props.projectedAtCurrentPace} solves by then. Baseline ${props.baseline} cleared.`;
    }
    if (props.verdict === "hit-target") {
      return `At ${props.problemsPerDay.toFixed(1)}/day you'll hit ${props.projectedAtCurrentPace}. Hit your ${props.targetPerDay}/day target → ${props.projectedAtTargetPace}. Baseline: ${props.baseline}.`;
    }
    return `At your target (${props.targetPerDay}/day) → ${props.projectedAtTargetPace} solves. Baseline ${props.baseline} needs ${props.neededPerDay}/day. Today is ${days === 1 ? "your last day" : "1 of " + days}.`;
  })();

  return (
    <Link
      href="/goals"
      className="block rounded-2xl px-5 py-4 group transition-transform hover:-translate-y-0.5"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: style.accent + "26" }}
        >
          <Icon className="w-5.5 h-5.5" style={{ color: style.accent }} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-bold"
            style={{ color: style.accent }}
          >
            {style.label}
          </p>
          <p className="text-base md:text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
            <span
              className="font-mono text-xl md:text-2xl"
              style={{ color: style.accent }}
            >
              {days}
            </span>{" "}
            <span className="text-[var(--color-text-secondary)] font-medium">
              {days === 1 ? "day" : "days"} until placement
            </span>
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
            {subline}
          </p>
        </div>

        <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  );
}
