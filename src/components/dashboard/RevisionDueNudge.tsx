"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { getDueCount } from "@/lib/revision-actions";

// Small dashboard banner: "N due for revision" -> Revision Corner.
// The doc's daily rhythm opens with the recall block, so surface it here.
export function RevisionDueNudge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDueCount()
      .then((c) => {
        if (!cancelled) setCount(c);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!count || count === 0) return null;

  return (
    <Link
      href="/revision"
      className="block rounded-2xl px-5 py-4 group transition-transform hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(90deg, rgba(34,211,238,0.16), rgba(79,140,255,0.05))",
        border: "1px solid rgba(34,211,238,0.35)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,211,238,0.18)" }}>
          <BrainCircuit className="w-5 h-5 text-[#22d3ee]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#22d3ee]">
            Revision Corner
          </p>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            <span className="font-mono text-[#22d3ee]">{count}</span> problem{count === 1 ? "" : "s"} due for review today
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Recall keeps the bank solvent. Clear the queue before new problems.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[#22d3ee] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}
