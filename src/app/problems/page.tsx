"use client";

import { useState, useEffect, useTransition } from "react";
import { ExternalLink, Search } from "lucide-react";
import { getProblems, getPatterns, updateProblemStatus } from "@/lib/actions";
import { getStatusBadge } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string | null;
  platform: string;
  url: string;
  status: string;
  attempts: number;
  masteryScore: number;
  subPattern: string | null;
  isChallenge: boolean;
  pattern: { id: string; name: string };
}

interface PatternOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "ATTEMPTED", label: "Attempted" },
  { value: "SOLVED", label: "Solved" },
  { value: "REVISED", label: "Revised" },
  { value: "MASTERED", label: "Mastered" },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [patterns, setPatterns] = useState<PatternOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterPattern, setFilterPattern] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPattern, filterStatus, filterDifficulty]);

  async function loadData() {
    const [probs, pats] = await Promise.all([
      getProblems({
        patternId: filterPattern || undefined,
        status: filterStatus || undefined,
        difficulty: filterDifficulty || undefined,
      }),
      getPatterns(),
    ]);
    setProblems(probs as unknown as Problem[]);
    setPatterns(pats.map((p) => ({ id: p.id, name: p.name })));
  }

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = (id: string, status: string) => {
    startTransition(async () => {
      await updateProblemStatus(id, status);
      await loadData();
    });
  };

  const solved = problems.filter((p) => ["SOLVED", "REVISED", "MASTERED"].includes(p.status)).length;

  const getDifficultyColor = (d: string | null) => {
    switch (d) {
      case "EASY": return "text-emerald-400";
      case "MEDIUM": return "text-amber-400";
      case "HARD": return "text-red-400";
      default: return "text-zinc-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problems</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Curated problem set across {/* */}
            <span className="font-medium text-[var(--color-text-primary)]">{problems.length}</span> problems
          </p>
        </div>

        {/* Progress chip */}
        <div className="section-card px-5 py-3 flex items-center gap-5">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Solved</p>
            <p className="text-xl font-bold font-mono text-[var(--color-accent-emerald)]">{solved}</p>
          </div>
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Remaining</p>
            <p className="text-xl font-bold font-mono text-[var(--color-accent-amber)]">{problems.length - solved}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-blue)]"
          />
        </div>

        <select
          value={filterPattern}
          onChange={(e) => setFilterPattern(e.target.value)}
          className="px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
        >
          <option value="">All patterns</option>
          {patterns.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-accent-blue)]"
        >
          <option value="">All difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block section-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Problem</th>
              <th className="text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Pattern</th>
              <th className="text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Diff</th>
              <th className="text-left text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3">Mastery</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => {
              const badge = getStatusBadge(problem.status);
              return (
                <tr
                  key={problem.id}
                  className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <select
                      value={problem.status}
                      onChange={(e) => handleStatus(problem.id, e.target.value)}
                      disabled={isPending}
                      className={`text-[10px] font-medium px-2 py-1 rounded border cursor-pointer ${badge.className}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {problem.title}
                    </span>
                    {problem.subPattern && (
                      <span className="block text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {problem.subPattern}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {problem.pattern.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${problem.masteryScore}%`,
                            backgroundColor:
                              problem.masteryScore >= 80 ? "var(--color-accent-emerald)" :
                              problem.masteryScore >= 40 ? "var(--color-accent-blue)" :
                              "var(--color-accent-amber)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[var(--color-text-muted)] w-9">
                        {problem.masteryScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded hover:bg-[var(--color-bg-elevated)] transition-colors inline-flex"
                    >
                      <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProblems.length === 0 && (
          <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">
            No problems match your filters.
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {filteredProblems.map((problem) => {
          const badge = getStatusBadge(problem.status);
          return (
            <div
              key={problem.id}
              className="section-card p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {problem.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {problem.pattern.name}{problem.subPattern ? ` · ${problem.subPattern}` : ""}
                  </p>
                </div>
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-[var(--color-bg-elevated)] shrink-0"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                </a>
              </div>
              <div className="flex items-center justify-between gap-2">
                <select
                  value={problem.status}
                  onChange={(e) => handleStatus(problem.id, e.target.value)}
                  disabled={isPending}
                  className={`text-[10px] font-medium px-2 py-1 rounded border cursor-pointer ${badge.className}`}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty ?? "—"}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    {problem.masteryScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProblems.length === 0 && (
          <div className="section-card p-8 text-center text-sm text-[var(--color-text-muted)]">
            No problems match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
