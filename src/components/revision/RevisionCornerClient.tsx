"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  ExternalLink,
  ChevronDown,
  Lightbulb,
} from "lucide-react";
import { PatternPractice } from "./PatternPractice";
import { savePropeersUrl } from "@/lib/revision-actions";

interface CoreProblem {
  id: string;
  title: string;
  url: string;
  anchorInsight: string | null;
  difficulty: string | null;
  status: string;
}

interface PPattern {
  id: string;
  name: string;
  order: number;
  revStep: number;
  revFailCount: number;
  propeersTopic: string | null;
  propeersSub: string | null;
  notesHint: string | null;
  isDue: boolean;
  status: "due" | "shaky" | "solid" | "unstarted";
  nextDueAt: string | Date | null;
  daysOverdue: number;
  core: CoreProblem[];
}

interface Data {
  propeersUrl: string | null;
  dueCount: number;
  nextDueAt: string | Date | null;
  patterns: PPattern[];
}

const STATUS_STYLE: Record<PPattern["status"], { label: string; color: string; bg: string }> = {
  due: { label: "Due", color: "#22d3ee", bg: "rgba(34,211,238,0.16)" },
  shaky: { label: "Shaky", color: "#fbbf24", bg: "rgba(245,158,11,0.14)" },
  solid: { label: "Solid", color: "#34d399", bg: "rgba(16,185,129,0.14)" },
  unstarted: { label: "Not started", color: "#6b6b7a", bg: "rgba(255,255,255,0.05)" },
};

export function RevisionCornerClient({ data }: { data: Data }) {
  const router = useRouter();
  const [reviewSet, setReviewSet] = useState<PPattern[] | null>(null);
  const [propeersInput, setPropeersInput] = useState(data.propeersUrl ?? "");
  const [savingUrl, startSaveUrl] = useTransition();

  if (reviewSet) {
    return (
      <PatternPractice
        patterns={reviewSet}
        propeersUrl={data.propeersUrl}
        onExit={() => {
          setReviewSet(null);
          router.refresh();
        }}
      />
    );
  }

  const dueList = data.patterns.filter((p) => p.isDue);
  const solid = data.patterns.filter((p) => p.status === "solid").length;
  const shaky = data.patterns.filter((p) => p.status === "shaky").length;

  const saveUrl = () => {
    startSaveUrl(async () => {
      await savePropeersUrl(propeersInput);
      router.refresh();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
          Retention &amp; repair
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Revision Corner</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-2xl">
          Pick a pattern, refresh it, then solve fresh problems in it. Recognition is what transfers.
        </p>
      </div>

      {/* Due today (suggested) */}
      {data.dueCount > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "linear-gradient(135deg, rgba(34,211,238,0.14), rgba(79,140,255,0.08) 60%, transparent), rgba(20,20,30,0.5)", border: "1px solid rgba(34,211,238,0.3)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="eyebrow mb-1">Suggested for today</p>
              <h2 className="text-xl font-bold">
                <span className="text-[#22d3ee] font-mono">{data.dueCount}</span>{" "}
                <span className="text-[var(--color-text-secondary)] font-medium">pattern{data.dueCount === 1 ? "" : "s"} due for practice</span>
              </h2>
            </div>
            <button
              onClick={() => setReviewSet(dueList)}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)", boxShadow: "0 6px 20px -6px rgba(34,211,238,0.5)" }}
            >
              Practice all due <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Propeers setup (once) */}
      {!data.propeersUrl && (
        <div className="rounded-xl p-4 glass-row">
          <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">Link your Propeers dashboard</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mb-3">
            Paste it once — every session gets a one-click &quot;Open Propeers&quot; button for fresh problems.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={propeersInput}
              onChange={(e) => setPropeersInput(e.target.value)}
              placeholder="https://…"
              className="glass-input flex-1 px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <button onClick={saveUrl} disabled={savingUrl || !propeersInput} className="px-3 py-2 rounded-lg text-xs font-semibold text-white shrink-0" style={{ background: "linear-gradient(90deg,#22d3ee,#4f8cff)" }}>
              {savingUrl ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Pick any pattern */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Choose a pattern to revise</h2>
          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{solid} solid · {shaky} shaky · {data.dueCount} due</span>
        </div>
        <div className="space-y-2.5">
          {data.patterns.map((p) => (
            <PatternRow key={p.id} pattern={p} onPractice={() => setReviewSet([p])} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PatternRow({ pattern: p, onPractice }: { pattern: PPattern; onPractice: () => void }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLE[p.status];
  return (
    <div className="section-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="text-xs font-mono font-bold text-[var(--color-accent-purple)] shrink-0">
          #{String(p.order).padStart(2, "0")}
        </span>
        <button onClick={() => setOpen((o) => !o)} className="flex-1 min-w-0 flex items-center gap-2 text-left">
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{p.name}</span>
          {p.core.length > 0 && (
            <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-text-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: s.color, background: s.bg }}>
          {s.label}{p.daysOverdue > 0 ? ` · ${p.daysOverdue}d` : ""}
        </span>
        <button
          onClick={onPractice}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-transform hover:scale-105"
          style={{ background: p.isDue ? "linear-gradient(90deg,#22d3ee,#4f8cff)" : "rgba(255,255,255,0.08)" }}
        >
          <Play className="w-3 h-3" /> Practice
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {p.propeersTopic && (
            <div className="text-[11px] text-[var(--color-text-muted)]">
              Fresh problems: <span className="text-[var(--color-text-secondary)]">{p.propeersTopic} › {p.propeersSub}</span>
            </div>
          )}
          {p.core.filter((c) => c.anchorInsight).map((c) => (
            <div key={c.id} className="glass-row rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-[var(--color-accent-amber)] shrink-0" />
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent-blue)] flex-1 truncate">
                  {c.title}
                </a>
                <ExternalLink className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-relaxed pl-5">{c.anchorInsight}</p>
            </div>
          ))}
          {p.core.filter((c) => c.anchorInsight).length === 0 && (
            <p className="text-[11px] text-[var(--color-text-muted)]">No CORE insights tagged for this pattern yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
