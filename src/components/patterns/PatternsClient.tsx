"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, Rocket, Sparkles } from "lucide-react";

interface Pattern {
  id: string;
  name: string;
  description: string;
  order: number;
  status: string;
  totalVideos: number;
  watchedVideos: number;
  totalProblems: number;
  solvedProblems: number;
  masteredProblems: number;
  mastery: number;
  completion: number;
}

type Filter = "all" | "basic" | "intermediate" | "advanced" | "mastered";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "basic", label: "Basic" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
  { key: "mastered", label: "Mastered" },
];

function difficulty(order: number): "basic" | "intermediate" | "advanced" {
  if (order <= 5) return "basic";
  if (order <= 10) return "intermediate";
  return "advanced";
}

export function PatternsClient({
  patterns,
  overallMastery,
}: {
  patterns: Pattern[];
  overallMastery: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return patterns.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "mastered") return p.mastery >= 80;
      return difficulty(p.order) === filter;
    });
  }, [patterns, filter, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
            Hi, Prakash
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Patterns</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            <span className="font-medium text-[var(--color-text-primary)]">
              {patterns.length} essential DSA patterns
            </span>{" · "}
            <span className="italic text-[var(--color-text-muted)]">
              Strategic mastery for interview preparation
            </span>
          </p>
        </div>

        {/* Overall mastery — rocket badge */}
        <div
          className="rounded-2xl p-5 flex items-center gap-4 min-w-[260px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(79, 140, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%), var(--color-bg-card)",
            border: "1px solid rgba(79, 140, 255, 0.25)",
            boxShadow: "0 8px 32px -8px rgba(79, 140, 255, 0.2)",
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] font-medium">
              Overall mastery
            </p>
            <p className="text-3xl font-bold font-mono leading-none mt-1 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] bg-clip-text text-transparent">
              {overallMastery}%
            </p>
            <div className="h-0.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden mt-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${overallMastery}%`,
                  background:
                    "linear-gradient(90deg, var(--color-accent-blue), var(--color-accent-purple))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-full">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                filter === f.key
                  ? "bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white shadow-lg shadow-blue-500/20"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
        </div>
      </div>

      {/* Pattern grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => (
          <PatternCard key={p.id} pattern={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="section-card p-10 text-center text-sm text-[var(--color-text-muted)]">
          No patterns match this filter.
        </div>
      )}
    </div>
  );
}

function PatternCard({ pattern: p }: { pattern: Pattern }) {
  const isMastered = p.mastery >= 80;
  const isInProgress = p.completion > 0 && !isMastered;

  // Status determines accent everything: top border, badge tint, percentage, bar
  const accent = isMastered
    ? {
        color: "var(--color-accent-emerald)",
        dim: "rgba(16, 185, 129, 0.15)",
        label: "MASTERED",
        bar: "linear-gradient(90deg, var(--color-accent-emerald), #34d399)",
        glow: "0 0 12px rgba(16, 185, 129, 0.5)",
      }
    : isInProgress
    ? {
        color: "var(--color-accent-amber)",
        dim: "rgba(245, 158, 11, 0.15)",
        label: "IN PROGRESS",
        bar: "linear-gradient(90deg, var(--color-accent-amber), #fbbf24)",
        glow: "0 0 12px rgba(245, 158, 11, 0.4)",
      }
    : {
        color: "var(--color-accent-blue)",
        dim: "rgba(79, 140, 255, 0.12)",
        label: "NOT STARTED",
        bar: "var(--color-border)",
        glow: "0 0 8px rgba(79, 140, 255, 0.2)",
      };
  const pctColor = isMastered
    ? "var(--color-accent-emerald)"
    : isInProgress
    ? "var(--color-accent-amber)"
    : "var(--color-accent-red)";

  return (
    <Link
      href={`/patterns/${p.id}`}
      className="group section-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl relative overflow-hidden"
      style={{
        boxShadow: `inset 0 2px 0 ${accent.color}`,
      }}
    >
      {/* Bright top border line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: accent.color,
          boxShadow: accent.glow,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-mono font-bold text-[var(--color-accent-purple)] tabular-nums">
            #{String(p.order).padStart(2, "0")}
          </span>
          <h3 className="text-base font-bold text-[var(--color-text-primary)] truncate">
            {p.name}
          </h3>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors shrink-0" />
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mb-4 min-h-[2rem] leading-relaxed">
        {p.description || "No description available."}
      </p>

      {/* Counts */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-xs font-mono">
          <span className="text-[var(--color-text-muted)]">Videos </span>
          <span
            className="font-bold"
            style={{
              color:
                p.watchedVideos > 0
                  ? "var(--color-accent-emerald)"
                  : "var(--color-text-muted)",
            }}
          >
            ({p.watchedVideos}/{p.totalVideos})
          </span>
        </span>
        <span className="text-xs font-mono">
          <span className="text-[var(--color-text-muted)]">Problems </span>
          <span
            className="font-bold"
            style={{
              color:
                p.solvedProblems > 0
                  ? "var(--color-accent-emerald)"
                  : "var(--color-text-muted)",
            }}
          >
            ({p.solvedProblems}/{p.totalProblems})
          </span>
        </span>
      </div>

      {/* Status badge + percentage */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md"
          style={{
            backgroundColor: accent.dim,
            color: accent.color,
          }}
        >
          {accent.label}
        </span>
        <span
          className="text-base font-bold font-mono tabular-nums"
          style={{ color: pctColor }}
        >
          {p.mastery}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
        <div
          className="h-full rounded-full progress-bar-fill"
          style={{
            width: `${Math.max(p.mastery, isInProgress ? 5 : 0)}%`,
            background: accent.bar,
            boxShadow: isInProgress || isMastered ? accent.glow : "none",
          }}
        />
      </div>
    </Link>
  );
}
