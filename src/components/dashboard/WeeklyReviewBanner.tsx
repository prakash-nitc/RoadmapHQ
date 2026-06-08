"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const DISMISSED_KEY = "dsa-weekly-review-dismissed";

// Sunday-only banner. Once dismissed for the week, stays hidden until next Sunday.
export function WeeklyReviewBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const today = new Date();
    if (today.getDay() !== 0) return; // 0 = Sunday in JS

    // Use ISO week as dismissal key — once you dismiss this Sunday, no nag this week.
    const key = `${today.getFullYear()}-W${Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )}`;
    const dismissed = window.localStorage.getItem(DISMISSED_KEY);
    if (dismissed === key) return;
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden flex items-center gap-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(79, 140, 255, 0.10) 60%, transparent)",
        border: "1px solid rgba(168, 85, 247, 0.3)",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(168, 85, 247, 0.2)" }}
      >
        <Sparkles className="w-5 h-5 text-[var(--color-accent-purple)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-accent-purple)]">
          Sunday ritual
        </p>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Your week in review is ready
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          What you crushed, what slipped, and next week&apos;s focus.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-blue)] text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
        >
          Open review
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => {
            const today = new Date();
            const key = `${today.getFullYear()}-W${Math.floor(
              (today.getTime() -
                new Date(today.getFullYear(), 0, 1).getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            )}`;
            window.localStorage.setItem(DISMISSED_KEY, key);
            setShow(false);
          }}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2"
        >
          Later
        </button>
      </div>
    </div>
  );
}
