"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Flame, Code2 } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns";

interface HeatmapEntry {
  date: string;
  count: number;
  isStudyDay: boolean;
}

interface Props {
  data: HeatmapEntry[];
  startDateISO: string;
  currentStreak: number;
  longestStreak: number;
  embedded?: boolean;
}

export function MonthlyStreakCalendar({
  data,
  startDateISO,
  currentStreak,
  longestStreak,
  embedded = false,
}: Props) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  // Lookup: yyyy-MM-dd → isStudyDay
  const studyDays = useMemo(() => {
    const map = new Map<string, boolean>();
    data.forEach((d) => map.set(d.date, d.isStudyDay));
    return map;
  }, [data]);

  const startDate = useMemo(() => startOfDay(parseISO(startDateISO)), [startDateISO]);
  const today = startOfDay(new Date());

  // Calendar grid covers the full weeks containing this month.
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const canGoForward = !isSameMonth(viewMonth, today);

  return (
    <div
      className={
        embedded
          ? "px-5 pt-5 pb-4 max-w-[360px] mx-auto"
          : "section-card p-5 max-w-[380px]"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="p-1 rounded-md hover:bg-[var(--color-bg-card-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <h2 className="text-sm font-bold text-[var(--color-text-primary)] px-3 py-0.5 rounded-full bg-[var(--color-bg-primary)]/60 border border-[var(--color-border-subtle)]">
          {format(viewMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          disabled={!canGoForward}
          className="p-1 rounded-md hover:bg-[var(--color-bg-card-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const isFuture = isBefore(today, day);
          const isPastStart = isBefore(day, startDate);
          const dayIsToday = isToday(day);
          const key = format(day, "yyyy-MM-dd");
          const studied = studyDays.get(key);

          // States, in priority order:
          //   1. Outside the viewed month → very dim number
          //   2. Today → halo + indicator
          //   3. Future → number, dim
          //   4. Before user started → number, dim
          //   5. Studied → 🔥
          //   6. Past day within journey, didn't study → 😭
          //   7. Otherwise (edge case) → number

          let content: React.ReactNode;
          let tone: "out" | "today" | "future" | "before" | "studied" | "missed" =
            "future";

          if (!inMonth) {
            tone = "out";
            content = format(day, "d");
          } else if (dayIsToday) {
            tone = "today";
            content = studied ? "🔥" : format(day, "d");
          } else if (isFuture) {
            tone = "future";
            content = format(day, "d");
          } else if (isPastStart) {
            tone = "before";
            content = format(day, "d");
          } else if (studied === true) {
            tone = "studied";
            content = "🔥";
          } else {
            tone = "missed";
            content = "😭";
          }

          const styleByTone: Record<typeof tone, string> = {
            out: "text-[var(--color-text-muted)] opacity-30",
            today:
              "ring-2 ring-[var(--color-accent-blue)] bg-[var(--color-accent-blue-dim)]/40 text-[var(--color-accent-blue)] font-bold",
            future: "text-[var(--color-text-muted)] opacity-60",
            before: "text-[var(--color-text-muted)] opacity-50",
            studied: "bg-[var(--color-accent-emerald-dim)]/20",
            missed: "bg-[var(--color-bg-primary)]/30",
          };

          return (
            <div
              key={key}
              title={
                inMonth
                  ? `${format(day, "MMM d, yyyy")} — ${
                      tone === "studied"
                        ? "Study day"
                        : tone === "missed"
                        ? "Missed"
                        : tone === "today"
                        ? "Today"
                        : tone === "future"
                        ? "Upcoming"
                        : "Before start"
                    }`
                  : format(day, "MMM d, yyyy")
              }
              className={`aspect-square rounded flex items-center justify-center text-[11px] select-none transition-colors ${styleByTone[tone]}`}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Footer — current + max streak, single compact strip */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)]">
          <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
            Current
          </span>
          <Flame className="w-3 h-3 text-[var(--color-accent-amber)]" />
          <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
            {currentStreak}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)]">
          <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
            Max
          </span>
          <Code2 className="w-3 h-3 text-[var(--color-accent-purple)]" />
          <span className="text-xs font-bold font-mono text-[var(--color-text-primary)]">
            {longestStreak}
          </span>
        </div>
      </div>
    </div>
  );
}
