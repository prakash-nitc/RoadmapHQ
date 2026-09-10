"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Plus,
  Star,
  Check,
  Trash2,
  NotebookText,
  BookOpen,
  X,
} from "lucide-react";
import {
  addMistake,
  toggleMistakeStar,
  toggleMistakeResolved,
  deleteMistake,
} from "@/lib/revision-actions";

interface Mistake {
  id: string;
  patternName: string;
  problemRef: string | null;
  missed: string;
  why: string;
  cue: string;
  starred: boolean;
  resolved: boolean;
  createdAt: string;
}

export function MistakeLog({
  initialMistakes,
  patternNames,
}: {
  initialMistakes: Mistake[];
  patternNames: string[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(initialMistakes.length === 0);
  const [filterPattern, setFilterPattern] = useState<string>("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  // form state
  const [pattern, setPattern] = useState(patternNames[0] ?? "");
  const [problemRef, setProblemRef] = useState("");
  const [missed, setMissed] = useState("");
  const [why, setWhy] = useState("");
  const [cue, setCue] = useState("");

  const canSubmit = pattern && missed.trim() && why.trim() && cue.trim();

  const submit = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      await addMistake({ patternName: pattern, problemRef, missed, why, cue });
      setProblemRef("");
      setMissed("");
      setWhy("");
      setCue("");
      setShowForm(false);
      router.refresh();
    });
  };

  const act = (fn: () => Promise<void>) => startTransition(async () => {
    await fn();
    router.refresh();
  });

  const filtered = initialMistakes.filter(
    (m) => (!filterPattern || m.patternName === filterPattern) && (!starredOnly || m.starred)
  );

  // ── Read-before-OA mode: starred first, one focus card at a time ──
  if (readMode) {
    const starred = initialMistakes.filter((m) => m.starred);
    const deck = starred.length > 0 ? starred : initialMistakes;
    return <ReadMode deck={deck} onClose={() => setReadMode(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/revision" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
        <ArrowLeft className="w-3.5 h-3.5" /> Revision Corner
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-1.5 mb-1"><NotebookText className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" /> Mistake Log</p>
          <h1 className="text-2xl md:text-3xl font-bold">What tripped you up</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
            Not a notes dump — the tight triad: what you <span className="text-[var(--color-text-primary)]">missed</span>, <span className="text-[var(--color-text-primary)]">why</span> it happened, and the one-line <span className="text-[var(--color-text-primary)]">cue</span> that stops it next time.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)" }}
        >
          <Plus className="w-4 h-4" /> Log a mistake
        </button>
        {initialMistakes.length > 0 && (
          <button
            onClick={() => setReadMode(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold glass-row"
          >
            <BookOpen className="w-4 h-4" /> Read before OA
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="section-card p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-1.5">Pattern</label>
              <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="glass-input w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)]">
                {patternNames.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow block mb-1.5">Problem (optional)</label>
              <input value={problemRef} onChange={(e) => setProblemRef(e.target.value)} placeholder="e.g. 3Sum" className="glass-input w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            </div>
          </div>
          <Field label="What I missed" value={missed} onChange={setMissed} placeholder="forgot to skip duplicates for l and r after a match" />
          <Field label="Why it happened" value={why} onChange={setWhy} placeholder="I assumed the outer dedup covers the inner. It doesn't." />
          <Field label="The cue that prevents it" value={cue} onChange={setCue} placeholder="dedup fires 3× in 3Sum: outer i, inner l, inner r" />
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm glass-row">Cancel</button>
            <button onClick={submit} disabled={!canSubmit || isPending} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)" }}>
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {initialMistakes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select value={filterPattern} onChange={(e) => setFilterPattern(e.target.value)} className="glass-input px-2.5 py-1.5 rounded-lg text-xs text-[var(--color-text-primary)]">
            <option value="">All patterns</option>
            {patternNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button
            onClick={() => setStarredOnly((s) => !s)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={starredOnly ? { background: "rgba(245,158,11,0.16)", color: "#fbbf24" } : { background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)" }}
          >
            <Star className="w-3.5 h-3.5" /> Starred
          </button>
          <span className="text-[11px] text-[var(--color-text-muted)] ml-auto">{filtered.length} shown</span>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="section-card p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {initialMistakes.length === 0 ? "No mistakes logged yet. Capture the next one the moment it happens." : "Nothing matches this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m) => (
            <div key={m.id} className="section-card p-4" style={m.resolved ? { opacity: 0.6 } : undefined}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#7ba9ff", background: "rgba(79,140,255,0.14)" }}>{m.patternName}</span>
                {m.problemRef && <span className="text-[11px] text-[var(--color-text-secondary)]">{m.problemRef}</span>}
                <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Missed</span><br />{m.missed}</p>
                <p><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Why</span><br />{m.why}</p>
                <p className="text-[var(--color-accent-amber)]"><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Cue</span><br />{m.cue}</p>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-[var(--color-border-subtle)]">
                <button onClick={() => act(() => toggleMistakeStar(m.id, !m.starred))} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Star">
                  <Star className="w-4 h-4" style={{ color: m.starred ? "#fbbf24" : "var(--color-text-muted)", fill: m.starred ? "#fbbf24" : "none" }} />
                </button>
                <button onClick={() => act(() => toggleMistakeResolved(m.id, !m.resolved))} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Mark internalised">
                  <Check className="w-4 h-4" style={{ color: m.resolved ? "#34d399" : "var(--color-text-muted)" }} />
                </button>
                <button onClick={() => act(() => deleteMistake(m.id))} className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.06)] ml-auto" title="Delete">
                  <Trash2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="eyebrow block mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="glass-input w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none" />
    </div>
  );
}

function ReadMode({ deck, onClose }: { deck: Mistake[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const m = deck[i];
  if (!m) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-[var(--color-text-muted)]">No entries to read.</p>
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm glass-row">Back</button>
      </div>
    );
  }
  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{i + 1} / {deck.length}</span>
        <button onClick={onClose} className="p-1.5 rounded-lg glass-row"><X className="w-4 h-4" /></button>
      </div>
      <div className="section-card p-6 space-y-4 min-h-[280px] flex flex-col justify-center">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start" style={{ color: "#7ba9ff", background: "rgba(79,140,255,0.14)" }}>{m.patternName}</span>
        <div className="space-y-3 text-base">
          <p><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Missed</span><br />{m.missed}</p>
          <p><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Why</span><br />{m.why}</p>
          <p className="text-[var(--color-accent-amber)] font-medium"><span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Cue</span><br />{m.cue}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="flex-1 py-2.5 rounded-lg text-sm glass-row disabled:opacity-40">Previous</button>
        <button onClick={() => setI((v) => Math.min(deck.length - 1, v + 1))} disabled={i === deck.length - 1} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40" style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)" }}>Next</button>
      </div>
    </div>
  );
}
