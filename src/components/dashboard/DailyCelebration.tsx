"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { X, Sparkles } from "lucide-react";

const QUOTES = [
  "One more day on the climb. The summit gets closer.",
  "The work compounds. So does your edge.",
  "You showed up. That's already top 10%.",
  "Done is a feature. You shipped it.",
  "Past-you would be proud. Future-you is taking notes.",
  "Repetition is the parent of intuition. Today fed it.",
  "You don't rise to your goals — you fall to your habits. Today's habit held.",
  "Hard things become easy because of days like this.",
  "A problem solved is a confidence locked in.",
  "Streaks don't break by accident. Today wasn't one.",
  "Slow is smooth. Smooth is fast. Today was smooth.",
  "Tomorrow's interview is being prepared right now.",
];

const STORAGE_KEY = "dsa-celebrated-on";

interface DailyCelebrationProps {
  missionComplete: boolean;
}

export function DailyCelebration({ missionComplete }: DailyCelebrationProps) {
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (!missionComplete) return;
    const todayKey = format(new Date(), "yyyy-MM-dd");
    if (typeof window === "undefined") return;
    const last = window.localStorage.getItem(STORAGE_KEY);
    if (last === todayKey) return;

    // Pick a random quote and fire celebration once per day.
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setShow(true);
    window.localStorage.setItem(STORAGE_KEY, todayKey);

    // Auto-dismiss after 8 seconds (user can close earlier).
    const t = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(t);
  }, [missionComplete]);

  if (!show) return null;

  return (
    <>
      {/* Confetti layer */}
      <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => {
          const colors = ["#22d3ee", "#a855f7", "#f59e0b", "#10b981", "#f472b6"];
          const color = colors[i % colors.length];
          const left = Math.random() * 100;
          const delay = Math.random() * 0.6;
          const duration = 2.4 + Math.random() * 1.4;
          const drift = (Math.random() - 0.5) * 200;
          const size = 6 + Math.random() * 8;
          return (
            <span
              key={i}
              className="confetti-piece"
              style={
                {
                  left: `${left}%`,
                  width: size,
                  height: size,
                  background: color,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  ["--drift" as string]: `${drift}px`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Centered toast */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[81] max-w-md w-[calc(100%-2rem)] pointer-events-auto">
        <div
          className="rounded-2xl p-5 relative shadow-2xl celebration-toast"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(168, 85, 247, 0.15)), rgba(22, 22, 31, 0.95)",
            border: "1px solid rgba(34, 211, 238, 0.4)",
            boxShadow:
              "0 20px 60px -10px rgba(0, 0, 0, 0.5), 0 0 30px rgba(34, 211, 238, 0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                Daily mission complete
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 italic">
                {quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
