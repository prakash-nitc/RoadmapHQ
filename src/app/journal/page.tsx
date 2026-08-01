"use client";

import { useState, useEffect, useTransition } from "react";
import { format, startOfDay } from "date-fns";
import { BookOpen, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { saveJournalEntry } from "@/lib/actions";

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entry, setEntry] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const dateStr = format(selectedDate, "EEEE, MMMM d, yyyy");

  useEffect(() => {
    // Load existing entry for selected date
    loadEntry();
  }, [selectedDate]);

  async function loadEntry() {
    const res = await fetch(`/api/journal?date=${format(selectedDate, "yyyy-MM-dd")}`);
    if (res.ok) {
      const data = await res.json();
      setEntry(data.entry ?? "");
    }
    setSaved(false);
  }

  const handleSave = () => {
    startTransition(async () => {
      await saveJournalEntry(startOfDay(selectedDate), entry);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const prevDay = () => {
    setSelectedDate((d) => new Date(d.getTime() - 86400000));
  };

  const nextDay = () => {
    const tomorrow = new Date(selectedDate.getTime() + 86400000);
    if (tomorrow <= new Date()) {
      setSelectedDate(tomorrow);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
          Reflect &amp; retain
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Daily journal</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
          What did you learn today?
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center">
        <div className="glass-input flex items-center gap-2 rounded-full px-2 py-1.5">
          <button
            onClick={prevDay}
            className="p-1.5 rounded-full hover:bg-[var(--color-bg-card-hover)] transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
          <p className="text-sm font-semibold text-[var(--color-text-primary)] px-3 min-w-[220px] text-center">
            {dateStr}
          </p>
          <button
            onClick={nextDay}
            disabled={startOfDay(selectedDate).getTime() >= startOfDay(new Date()).getTime()}
            className="p-1.5 rounded-full hover:bg-[var(--color-bg-card-hover)] transition-colors disabled:opacity-30"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>
      </div>

      {/* Journal Entry */}
      <div className="section-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[var(--color-accent-blue)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Journal entry
          </h2>
        </div>

        <textarea
          value={entry}
          onChange={(e) => { setEntry(e.target.value); setSaved(false); }}
          placeholder="Write about what you learned today... key concepts, breakthroughs, mistakes, insights..."
          rows={12}
          className="glass-input w-full rounded-lg p-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors resize-y font-mono leading-relaxed"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[var(--color-text-muted)]">
            {entry.length} characters
          </span>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-[var(--color-accent-emerald)] animate-pulse">
                ✓ Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : "Save entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
