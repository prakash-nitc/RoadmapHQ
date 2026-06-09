"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays } from "date-fns";

interface HeatmapEntry {
  date: string;
  count: number;
  isStudyDay: boolean;
}

export function GitHubHeatmap({
  data,
  embedded = false,
}: {
  data: HeatmapEntry[];
  embedded?: boolean;
}) {
  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const yearAgo = subDays(today, 364);
    const dataMap = new Map(data.map((d) => [d.date, d]));

    // Start from the Monday of the week containing yearAgo
    const start = startOfWeek(yearAgo, { weekStartsOn: 1 });

    const weeks: { date: Date; entry: HeatmapEntry | null }[][] = [];
    let currentWeek: { date: Date; entry: HeatmapEntry | null }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = "";

    let day = start;
    let colIndex = 0;

    while (day <= today) {
      const dateStr = format(day, "yyyy-MM-dd");
      const monthLabel = format(day, "MMM");

      if (day.getDay() === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
        colIndex++;
      }

      if (monthLabel !== lastMonth && day.getDay() <= 1) {
        months.push({ label: monthLabel, col: colIndex });
        lastMonth = monthLabel;
      }

      currentWeek.push({
        date: day,
        entry: dataMap.get(dateStr) ?? null,
      });

      day = addDays(day, 1);
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, months };
  }, [data]);

  const getColor = (entry: HeatmapEntry | null): string => {
    if (!entry || !entry.isStudyDay) return "var(--color-heatmap-0)";
    if (entry.count >= 5) return "var(--color-heatmap-4)";
    if (entry.count >= 3) return "var(--color-heatmap-3)";
    if (entry.count >= 2) return "var(--color-heatmap-2)";
    return "var(--color-heatmap-1)";
  };

  const totalStudyDays = data.filter((d) => d.isStudyDay).length;

  return (
    <div className={embedded ? "p-6 pt-7" : "section-card p-6 h-full"}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Study activity
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            <span className="font-bold text-[var(--color-accent-emerald)]">{totalStudyDays}</span> study days · last 365 days
          </p>
        </div>
      </div>

      {/* Month labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[750px]">
          <div className="flex ml-8 mb-1">
            {months.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                className="text-[10px] text-[var(--color-text-muted)]"
                style={{ marginLeft: i === 0 ? `${m.col * 14}px` : `${(m.col - (months[i - 1]?.col ?? 0)) * 14 - 24}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 shrink-0">
              {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                <span key={i} className="text-[10px] text-[var(--color-text-muted)] h-[12px] leading-[12px]">
                  {d}
                </span>
              ))}
            </div>

            {/* Cells */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di];
                  if (!cell) {
                    return <div key={di} className="w-[12px] h-[12px]" />;
                  }
                  return (
                    <div
                      key={di}
                      className="heatmap-cell w-[12px] h-[12px] cursor-pointer"
                      style={{ backgroundColor: getColor(cell.entry) }}
                      title={`${format(cell.date, "MMM dd, yyyy")}: ${
                        cell.entry?.isStudyDay
                          ? `${cell.entry.count} activities`
                          : "No activity"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-[var(--color-text-muted)] mr-1">Less</span>
            {[
              "var(--color-heatmap-0)",
              "var(--color-heatmap-1)",
              "var(--color-heatmap-2)",
              "var(--color-heatmap-3)",
              "var(--color-heatmap-4)",
            ].map((c, i) => (
              <div
                key={i}
                className="w-[12px] h-[12px] rounded-sm"
                style={{ backgroundColor: c }}
              />
            ))}
            <span className="text-[10px] text-[var(--color-text-muted)] ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
