"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { Search, Pencil, Trash2, Check, X, ExternalLink } from "lucide-react";
import {
  getProblemsForAdmin,
  updateProblem,
  deleteProblem,
} from "@/lib/actions";

interface AdminProblem {
  id: string;
  title: string;
  url: string;
  difficulty: string | null;
  platform: string;
  subPattern: string | null;
  patternId: string;
  patternName: string;
}

interface PatternOption {
  id: string;
  name: string;
}

export function ManageProblems({ patterns }: { patterns: PatternOption[] }) {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [search, setSearch] = useState("");
  const [filterPattern, setFilterPattern] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  // Draft state for the row being edited
  const [draft, setDraft] = useState<AdminProblem | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getProblemsForAdmin();
    setProblems(data);
    setLoaded(true);
  }

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch = p.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchPattern = !filterPattern || p.patternId === filterPattern;
      return matchSearch && matchPattern;
    });
  }, [problems, search, filterPattern]);

  const startEdit = (p: AdminProblem) => {
    setEditingId(p.id);
    setDraft({ ...p });
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    startTransition(async () => {
      await updateProblem(draft.id, {
        title: draft.title,
        url: draft.url,
        difficulty: draft.difficulty || null,
        platform: draft.platform,
        subPattern: draft.subPattern || null,
        patternId: draft.patternId,
      });
      await load();
      cancelEdit();
    });
  };

  const doDelete = (id: string) => {
    startTransition(async () => {
      await deleteProblem(id);
      await load();
      setConfirmDeleteId(null);
    });
  };

  const diffColor = (d: string | null) => {
    switch (d) {
      case "EASY": return "text-emerald-400";
      case "MEDIUM": return "text-amber-400";
      case "HARD": return "text-red-400";
      default: return "text-zinc-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search problems to edit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          />
        </div>
        <select
          value={filterPattern}
          onChange={(e) => setFilterPattern(e.target.value)}
          className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]"
        >
          <option value="">All patterns</option>
          {patterns.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        {filtered.length} problem{filtered.length === 1 ? "" : "s"}
      </p>

      {/* List */}
      <div className="fade-scroll-y space-y-2 max-h-[560px] overflow-y-auto pr-1 -mr-1">
        {filtered.map((p) => {
          const isEditing = editingId === p.id;

          if (isEditing && draft) {
            return (
              <div
                key={p.id}
                className="glass-row rounded-lg p-4 space-y-3 !border-[var(--color-accent-blue)]/40"
              >
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Title"
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)]"
                />
                <input
                  type="url"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="URL"
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)]"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <select
                    value={draft.patternId}
                    onChange={(e) => setDraft({ ...draft, patternId: e.target.value })}
                    className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]"
                  >
                    {patterns.map((pat) => (
                      <option key={pat.id} value={pat.id}>{pat.name}</option>
                    ))}
                  </select>
                  <select
                    value={draft.difficulty ?? ""}
                    onChange={(e) => setDraft({ ...draft, difficulty: e.target.value || null })}
                    className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]"
                  >
                    <option value="">No difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                  <select
                    value={draft.platform}
                    onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
                    className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]"
                  >
                    <option value="LEETCODE">LeetCode</option>
                    <option value="GFG">GFG</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input
                    type="text"
                    value={draft.subPattern ?? ""}
                    onChange={(e) => setDraft({ ...draft, subPattern: e.target.value || null })}
                    placeholder="Sub-pattern"
                    className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={isPending || !draft.title || !draft.url}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card-hover)]"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={p.id}
              className="glass-row rounded-lg p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {p.title}
                  </p>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)]"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                  <span className="text-[var(--color-text-muted)]">{p.patternName}</span>
                  {p.difficulty && (
                    <span className={diffColor(p.difficulty)}>· {p.difficulty}</span>
                  )}
                  <span className="text-[var(--color-text-muted)]">· {p.platform}</span>
                  {p.subPattern && (
                    <span className="text-[var(--color-text-muted)]">· {p.subPattern}</span>
                  )}
                </div>
              </div>

              {confirmDeleteId === p.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-[var(--color-text-muted)]">Delete?</span>
                  <button
                    onClick={() => doDelete(p.id)}
                    disabled={isPending}
                    className="px-2 py-1 text-[10px] font-medium rounded bg-[var(--color-accent-red)] text-white hover:opacity-90"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2 py-1 text-[10px] font-medium rounded border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-bg-elevated)]"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] hover:bg-[var(--color-bg-elevated)]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
            No problems match your search.
          </div>
        )}
      </div>
    </div>
  );
}
