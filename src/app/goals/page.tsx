"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  getDashboardData,
} from "@/lib/actions";
import { RealityCheck } from "@/components/goals/RealityCheck";

export default function GoalsPage() {
  const [targetDate, setTargetDate] = useState("");
  const [dailyVideos, setDailyVideos] = useState(2);
  const [dailyProblems, setDailyProblems] = useState(3);
  const [dailyStudyMins, setDailyStudyMins] = useState(120);
  const [dashData, setDashData] = useState<{
    totalProblems: number;
    solvedProblems: number;
    totalVideos: number;
    watchedVideos: number;
    problemsPerDay: number;
    projectedDate: string;
    paceOnlyDate: string | null;
    paceWindow: number;
    targetPerDay: number;
    placementCountdown: {
      daysRemaining: number | null;
      isSet: boolean;
      baseline: number;
      projectedAtCurrentPace: number;
      projectedAtTargetPace: number;
      neededPerDay: number;
      verdict: "on-track" | "hit-target" | "behind" | "no-date";
    };
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [settings, dash] = await Promise.all([
      getSettings(),
      getDashboardData(),
    ]);
    if (settings) {
      setDailyVideos(settings.dailyTargetVideos);
      setDailyProblems(settings.dailyTargetProblems);
      setDailyStudyMins(settings.dailyTargetStudyMins);
      if (settings.targetDate) {
        setTargetDate(settings.targetDate.toISOString().split("T")[0]);
      }
    }
    setDashData({
      totalProblems: dash.totalProblems,
      solvedProblems: dash.solvedProblems,
      totalVideos: dash.totalVideos,
      watchedVideos: dash.watchedVideos,
      problemsPerDay: dash.problemsPerDay,
      projectedDate: dash.projectedDate,
      paceOnlyDate: dash.paceOnlyDate,
      paceWindow: dash.paceWindow,
      targetPerDay: dash.targetPerDay,
      placementCountdown: dash.placementCountdown,
    });
  }

  const handleSave = () => {
    startTransition(async () => {
      await updateSettings({
        targetDate: targetDate ? new Date(targetDate) : undefined,
        dailyTargetVideos: dailyVideos,
        dailyTargetProblems: dailyProblems,
        dailyTargetStudyMins: dailyStudyMins,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  };

  const remainingProblems = dashData
    ? dashData.totalProblems - dashData.solvedProblems
    : 0;
  const remainingVideos = dashData
    ? dashData.totalVideos - dashData.watchedVideos
    : 0;
  const daysUntilTarget = targetDate
    ? Math.max(
        1,
        Math.ceil(
          (new Date(targetDate).getTime() - Date.now()) / 86400000
        )
      )
    : null;

  const requiredProblemsPerDay = daysUntilTarget
    ? Math.ceil((remainingProblems / daysUntilTarget) * 10) / 10
    : null;
  const requiredVideosPerDay = daysUntilTarget
    ? Math.ceil((remainingVideos / daysUntilTarget) * 10) / 10
    : null;

  // 3-state verdict:
  //   on-track   — observed pace already meets required
  //   hit-target — observed is below required, but your daily targets cover it
  //   behind     — even hitting your targets won't make the date
  const verdict: "on-track" | "hit-target" | "behind" | null =
    requiredProblemsPerDay === null ||
    requiredVideosPerDay === null ||
    !dashData
      ? null
      : dashData.problemsPerDay >= requiredProblemsPerDay
      ? "on-track"
      : dailyProblems >= requiredProblemsPerDay &&
        dailyVideos >= requiredVideosPerDay
      ? "hit-target"
      : "behind";

  const paceStats = dashData
    ? [
        {
          icon: TrendingUp,
          label: `Current pace (${dashData.paceWindow}d window)`,
          value: `${dashData.problemsPerDay}/day`,
          color: "var(--color-accent-blue)",
          hint:
            dashData.paceOnlyDate
              ? `At this pace: ${dashData.paceOnlyDate}`
              : "Solve more to set a pace",
        },
        {
          icon: Calendar,
          label: "Projected completion",
          value: dashData.projectedDate,
          color: "var(--color-accent-purple)",
          hint: "Using the better of observed or target pace",
        },
        {
          icon: Target,
          label: "Problems remaining",
          value: String(remainingProblems),
          color: "var(--color-accent-amber)",
          hint: `${dashData.solvedProblems} of ${dashData.totalProblems} done`,
        },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Goals &amp; projections
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Set a target date and daily intent — the dashboard does the math.
        </p>
      </div>

      {/* Pace cards */}
      {dashData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paceStats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="section-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: s.color + "22" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium">
                    {s.label}
                  </span>
                </div>
                <p
                  className="text-2xl font-bold font-mono truncate"
                  style={{ color: s.color }}
                  title={s.value}
                >
                  {s.value}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 truncate">
                  {s.hint}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Reality check — placement-date-driven verdict */}
      {dashData && (
        <RealityCheck
          daysRemaining={dashData.placementCountdown.daysRemaining ?? 0}
          baseline={dashData.placementCountdown.baseline}
          solvedProblems={dashData.solvedProblems}
          totalProblems={dashData.totalProblems}
          problemsPerDay={dashData.problemsPerDay}
          targetPerDay={dashData.targetPerDay}
          projectedAtCurrentPace={dashData.placementCountdown.projectedAtCurrentPace}
          projectedAtTargetPace={dashData.placementCountdown.projectedAtTargetPace}
          neededPerDay={dashData.placementCountdown.neededPerDay}
          verdict={dashData.placementCountdown.verdict}
        />
      )}

      {/* Target verdict */}
      {daysUntilTarget && requiredProblemsPerDay && requiredVideosPerDay && verdict && (
        <VerdictPanel
          verdict={verdict}
          targetDate={targetDate}
          daysUntilTarget={daysUntilTarget}
          requiredProblems={requiredProblemsPerDay}
          requiredVideos={requiredVideosPerDay}
          targetProblems={dailyProblems}
          targetVideos={dailyVideos}
          observedProblems={dashData?.problemsPerDay ?? 0}
        />
      )}

      {/* Settings form */}
      <div className="section-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-amber)]" />
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Daily targets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Placement date">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
            />
          </Field>
          <Field label="Daily study time (minutes)">
            <input
              type="number"
              value={dailyStudyMins}
              onChange={(e) =>
                setDailyStudyMins(parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
            />
          </Field>
          <Field label="Daily videos target">
            <input
              type="number"
              value={dailyVideos}
              onChange={(e) =>
                setDailyVideos(parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
            />
          </Field>
          <Field label="Daily problems target">
            <input
              type="number"
              value={dailyProblems}
              onChange={(e) =>
                setDailyProblems(parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            {isPending ? "Saving..." : "Save settings"}
          </button>
          {saved && (
            <span className="text-sm text-[var(--color-accent-emerald)] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5 font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function VerdictPanel({
  verdict,
  targetDate,
  daysUntilTarget,
  requiredProblems,
  requiredVideos,
  targetProblems,
  targetVideos,
  observedProblems,
}: {
  verdict: "on-track" | "hit-target" | "behind";
  targetDate: string;
  daysUntilTarget: number;
  requiredProblems: number;
  requiredVideos: number;
  targetProblems: number;
  targetVideos: number;
  observedProblems: number;
}) {
  const config = {
    "on-track": {
      icon: CheckCircle2,
      iconColor: "var(--color-accent-emerald)",
      title: "On track",
      blurb: `You're already solving ${observedProblems}/day — that's at or above what you need.`,
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.03))",
      border: "rgba(16, 185, 129, 0.3)",
    },
    "hit-target": {
      icon: Target,
      iconColor: "var(--color-accent-blue)",
      title: "On track if you hit your targets",
      blurb: `Your current pace (${observedProblems}/day) is below the required rate, but your daily targets cover it. Hit them and you'll make the date.`,
      bg: "linear-gradient(135deg, rgba(79, 140, 255, 0.15), rgba(79, 140, 255, 0.03))",
      border: "rgba(79, 140, 255, 0.3)",
    },
    behind: {
      icon: AlertTriangle,
      iconColor: "var(--color-accent-red)",
      title: "Behind schedule",
      blurb: `Even hitting your daily targets won't make this date. Bump them up or pick a later target.`,
      bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.03))",
      border: "rgba(239, 68, 68, 0.3)",
    },
  }[verdict];

  const Icon = config.icon;

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {config.title}
        </h3>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {config.blurb}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        To finish by{" "}
        <span className="font-mono font-bold text-[var(--color-text-primary)]">
          {targetDate}
        </span>{" "}
        ({daysUntilTarget} days):
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NeedVsTarget
          label="Problems"
          need={requiredProblems}
          target={targetProblems}
        />
        <NeedVsTarget
          label="Videos"
          need={requiredVideos}
          target={targetVideos}
        />
      </div>
    </div>
  );
}

function NeedVsTarget({
  label,
  need,
  target,
}: {
  label: string;
  need: number;
  target: number;
}) {
  const targetCoversNeed = target >= need;
  const targetColor = targetCoversNeed
    ? "var(--color-accent-emerald)"
    : "var(--color-accent-red)";

  return (
    <div className="bg-[var(--color-bg-primary)]/40 rounded-lg p-4">
      <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2 font-medium">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)] leading-none">
            {need}
            <span className="text-xs text-[var(--color-text-muted)] ml-1">/day</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            You need
          </p>
        </div>
        <div className="border-l border-[var(--color-border-subtle)] pl-3">
          <p
            className="text-2xl font-bold font-mono leading-none"
            style={{ color: targetColor }}
          >
            {target}
            <span className="text-xs text-[var(--color-text-muted)] ml-1">/day</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            Your target {targetCoversNeed ? "✓" : "✗"}
          </p>
        </div>
      </div>
    </div>
  );
}
