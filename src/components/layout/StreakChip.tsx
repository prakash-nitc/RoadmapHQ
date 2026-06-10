"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles, Star, Snowflake } from "lucide-react";
import { getStreakSummary } from "@/lib/actions";

interface StreakStage {
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  glow: string;
  ringClass: string;
}

function stageFor(streak: number): StreakStage {
  if (streak >= 100)
    return {
      label: "Constellation",
      icon: Star,
      color: "#c084fc",
      glow: "0 0 18px rgba(192, 132, 252, 0.7)",
      ringClass: "ring-2 ring-purple-400/40",
    };
  if (streak >= 30)
    return {
      label: "Blue flame",
      icon: Flame,
      color: "#60a5fa",
      glow: "0 0 14px rgba(96, 165, 250, 0.6)",
      ringClass: "ring-2 ring-blue-400/40",
    };
  if (streak >= 7)
    return {
      label: "Flame",
      icon: Flame,
      color: "#f59e0b",
      glow: "0 0 12px rgba(245, 158, 11, 0.5)",
      ringClass: "ring-1 ring-amber-400/40",
    };
  if (streak >= 1)
    return {
      label: "Spark",
      icon: Sparkles,
      color: "#fbbf24",
      glow: "0 0 8px rgba(251, 191, 36, 0.4)",
      ringClass: "ring-1 ring-amber-300/30",
    };
  return {
    label: "Ember",
    icon: Snowflake,
    color: "#6b7280",
    glow: "none",
    ringClass: "",
  };
}

export function StreakChip() {
  const [data, setData] = useState<{
    currentStreak: number;
    longestStreak: number;
    isStudyDayToday: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        const result = await getStreakSummary();
        if (!cancelled) setData(result);
      } catch {
        // Non-fatal — sidebar chip just won't render.
      }
    };
    refresh();
    // Refresh on tab focus so the chip updates when you return to the app.
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!data) {
    return (
      <div className="px-3 py-2.5 rounded-lg bg-[var(--color-bg-card)]/40 border border-[var(--color-border-subtle)]">
        <div className="h-9 animate-pulse opacity-50" />
      </div>
    );
  }

  const stage = stageFor(data.currentStreak);
  const Icon = stage.icon;
  const atRisk = !data.isStudyDayToday && data.currentStreak > 0;

  if (atRisk) {
    return (
      <div className="relative streak-at-risk rounded-lg px-3 py-2.5 flex items-center gap-3 overflow-hidden">
        {/* Pulsing inner glow */}
        <div className="absolute inset-0 streak-glow-pulse pointer-events-none" />

        <div
          className="relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-2 ring-[#f59e0b]"
          style={{
            backgroundColor: "#f59e0b",
            boxShadow:
              "0 0 16px rgba(245, 158, 11, 0.85), 0 0 4px rgba(255, 255, 255, 0.3) inset",
          }}
        >
          <Icon className="w-4.5 h-4.5 text-white flame-flicker" />
          {/* Pulse dot ! */}
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 ring-2 ring-[var(--color-bg-secondary)] pulse-dot" />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono leading-none text-white">
              {data.currentStreak}
            </span>
            <span className="text-[10px] text-amber-100 uppercase tracking-widest font-semibold">
              {data.currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-100 truncate">
            At risk · finish today
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stage.ringClass}`}
        style={{
          backgroundColor: stage.color + "22",
          boxShadow: stage.glow,
        }}
      >
        <Icon className="w-4 h-4" style={{ color: stage.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span
            className="text-lg font-bold font-mono leading-none"
            style={{ color: stage.color }}
          >
            {data.currentStreak}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest">
            {data.currentStreak === 1 ? "day" : "days"}
          </span>
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] truncate">
          {stage.label}
        </div>
      </div>
    </div>
  );
}
