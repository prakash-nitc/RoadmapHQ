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
          ? "px-7 pt-7 pb-6"
          : "section-card p-6"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-md hover:bg-[var(--color-bg-card-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
            Study calendar
          </p>
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">
            {format(viewMonth, "MMMM yyyy")}
          </h2>
        </div>

        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          disabled={!canGoForward}
          className="p-1.5 rounded-md hover:bg-[var(--color-bg-card-hover)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
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
              className={`aspect-square rounded-md flex items-center justify-center text-sm select-none transition-colors ${styleByTone[tone]}`}
            >
              {content}
            </div>
          );
        })}
      </div>

      {/* Footer — current + max streak */}
      <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">
            Current
          </span>
          <Flame className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
          <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
            {currentStreak}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border-subtle)]">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-semibold">
            Max
          </span>
          <Code2 className="w-3.5 h-3.5 text-[var(--color-accent-purple)]" />
          <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
            {longestStreak}
          </span>
        </div>
      </div>
    </div>
  );
}
