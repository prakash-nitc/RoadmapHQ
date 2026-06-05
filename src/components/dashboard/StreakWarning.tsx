"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface StreakWarningProps {
  currentStreak: number;
  missionComplete: boolean;
}

// Tiers of urgency based on local hour. 0 = no warning yet.
function urgencyFor(hour: number, minute: number) {
  const decimalHour = hour + minute / 60;
  if (decimalHour >= 23) return 3;       // 11 PM — red
  if (decimalHour >= 22) return 2;       // 10 PM — orange
  if (decimalHour >= 20) return 1;       // 8 PM — amber
  return 0;
}

function timeRemaining(now: Date): string {
  const eod = new Date(now);
  eod.setHours(23, 59, 59, 999);
  const diffMs = eod.getTime() - now.getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function StreakWarning({
  currentStreak,
  missionComplete,
}: StreakWarningProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);

  if (!now) return null;
  if (missionComplete) return null;
  if (currentStreak < 1) return null;

  const urgency = urgencyFor(now.getHours(), now.getMinutes());
  if (urgency === 0) return null;

  const palette = [
    null,
    {
      bg: "linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.04))",
      border: "rgba(245, 158, 11, 0.4)",
      color: "var(--color-accent-amber)",
      label: "Heads up",
    },
    {
      bg: "linear-gradient(90deg, rgba(249, 115, 22, 0.22), rgba(249, 115, 22, 0.06))",
      border: "rgba(249, 115, 22, 0.5)",
      color: "#fb923c",
      label: "Running short",
    },
    {
      bg: "linear-gradient(90deg, rgba(239, 68, 68, 0.28), rgba(239, 68, 68, 0.08))",
      border: "rgba(239, 68, 68, 0.6)",
      color: "var(--color-accent-red)",
      label: "Streak at risk",
    },
  ][urgency]!;

  const Icon = urgency === 3 ? AlertTriangle : Clock;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: palette.color + "22" }}
      >
        <Icon className="w-5 h-5" style={{ color: palette.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold"
          style={{ color: palette.color }}
        >
          {palette.label} — {timeRemaining(now)} to keep your{" "}
          {currentStreak}-day streak alive
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
          Finish today&apos;s mission below before midnight to bank day {currentStreak + 1}.
        </p>
      </div>
    </div>
  );
}
