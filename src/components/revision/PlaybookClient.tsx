"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Zap,
  Layers,
  Wrench,
  Shuffle,
  ListChecks,
  AlertTriangle,
  Quote,
} from "lucide-react";
import {
  TRIGGERS,
  MODES,
  MODE_MATRIX,
  LADDER,
  SCHEDULE,
  YIELD,
  SHEETS,
  MISTAKE_FIELDS,
} from "@/lib/playbook-content";

type Tab = "triggers" | "modes" | "ladder" | "repair" | "mixed" | "habits";

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "triggers", label: "Triggers", icon: Zap },
  { key: "modes", label: "The 3 modes", icon: Layers },
  { key: "ladder", label: "Ladder & schedule", icon: ListChecks },
  { key: "repair", label: "Repair", icon: Wrench },
  { key: "mixed", label: "Interleaving", icon: Shuffle },
  { key: "habits", label: "Rules & habits", icon: BookOpen },
];

export function PlaybookClient() {
  const [tab, setTab] = useState<Tab>("triggers");
  const [q, setQ] = useState("");

  const filteredTriggers = TRIGGERS.filter(
    (t) =>
      t.signal.toLowerCase().includes(q.toLowerCase()) ||
      t.pattern.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/revision" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
        <ArrowLeft className="w-3.5 h-3.5" /> Revision Corner
      </Link>

      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent-purple)]" />
          The protocol, in the app
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Revision Playbook</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-2xl">
          Everything from your strategy doc that you actually need mid-revision — the triggers,
          the modes, the repair rules. So you never have to reopen the document.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-transform hover:scale-[1.03]"
              style={
                active
                  ? { background: "linear-gradient(90deg,#7c5cff,#4f8cff)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.05)", color: "var(--color-text-secondary)" }
              }
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TRIGGERS ── */}
      {tab === "triggers" && (
        <div className="space-y-4">
          <Callout accent="#a855f7">
            Read a problem, name the pattern within 60 seconds, better than 80% accuracy.
            <strong className="text-[var(--color-text-primary)]"> That is interview readiness. Problem count is not.</strong>
          </Callout>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a signal or pattern…"
              className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>

          <div className="space-y-2">
            {filteredTriggers.map((t, i) => (
              <div key={i} className="section-card p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-sm text-[var(--color-text-secondary)] flex-1 leading-relaxed">
                  {t.signal}
                </p>
                <span
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto"
                  style={{ color: "#c4b5fd", background: "rgba(124,92,255,0.16)" }}
                >
                  {t.pattern}
                </span>
              </div>
            ))}
            {filteredTriggers.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No trigger matches that.</p>
            )}
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">The drill itself</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Ten minutes, twice a week. The doc calls it &quot;the highest return-per-minute activity in this
              entire document, and almost nobody does it.&quot; Open 10 problems you&apos;ve never solved, read only the
              statement, and in 60 seconds write the pattern and the one sentence that identifies it. Score out of 10.
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              <strong className="text-[var(--color-text-primary)]">Below 7/10</strong> means your pattern-trigger mapping is weak —
              and no amount of additional solving will fix it. The fix is more of this drill, not more problems.
            </p>
            <Link href="/revision/drill" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg,#7c5cff,#4f8cff)" }}>
              <Zap className="w-3.5 h-3.5" /> Run the drill in-app
            </Link>
          </div>
        </div>
      )}

      {/* ── MODES ── */}
      {tab === "modes" && (
        <div className="space-y-4">
          <Callout accent="#22d3ee">
            Your notes are an answer key, not study material. Reading them produces recognition, not recall.
            <strong className="text-[var(--color-text-primary)]"> The rule: notes open AFTER you attempt, never before.</strong>
          </Callout>

          {MODES.map((m) => (
            <div key={m.n} className="section-card p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: m.accent, background: `${m.accent}22` }}>
                  MODE {m.n}
                </span>
                <h3 className="text-base font-bold">{m.name}</h3>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{m.time}</span>
                <span className="text-[11px] text-[var(--color-text-muted)] ml-auto">{m.setup}</span>
              </div>
              <ol className="space-y-1.5 mb-3">
                {m.steps.map((s, i) => (
                  <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex gap-2">
                    <span className="font-mono shrink-0" style={{ color: m.accent }}>{i + 1}.</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {m.note && (
                <p className="text-[11px] text-[var(--color-text-muted)] italic leading-relaxed pt-2.5 border-t border-[var(--color-border-subtle)]">
                  {m.note}
                </p>
              )}
            </div>
          ))}

          <div className="section-card p-5" style={{ borderColor: "rgba(239,68,68,0.28)" }}>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#f87171]" /> The escape procedure
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Reading the solution is not the end of the transaction. It costs you a re-solve, always —
              otherwise &quot;check the notes&quot; becomes the default escape hatch and revision silently turns back into reading.
            </p>
            <ol className="space-y-1.5">
              {[
                "Open the note. Read it properly — until you understand why, not just what.",
                "Close it. Re-solve from scratch immediately, same session, about 10 minutes later.",
                "Reproduced it → mark Attempted (not Solved) and schedule it 3 days out.",
                "Could not reproduce it even after reading → the pattern concept itself is gone. Stop working this problem; repair the pattern (Case A).",
              ].map((s, i) => (
                <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex gap-2">
                  <span className="font-mono shrink-0 text-[#f87171]">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-3">Which mode for which situation</h3>
            <div className="space-y-2">
              {MODE_MATRIX.map((r, i) => (
                <div key={i} className="glass-row rounded-lg px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <span className="text-xs font-medium text-[var(--color-text-primary)] sm:w-52 shrink-0">{r.situation}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{r.mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LADDER & SCHEDULE ── */}
      {tab === "ladder" && (
        <div className="space-y-4">
          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-3">The mastery ladder</h3>
            <div className="space-y-2">
              {LADDER.map((l) => (
                <div key={l.level} className="glass-row rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: l.color, background: `${l.color}22` }}>
                      {l.level}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{l.meaning}</p>
                  {l.next !== "—" && (
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-relaxed">→ {l.next}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="section-card p-5" style={{ borderColor: "rgba(245,158,11,0.28)" }}>
            <h3 className="text-sm font-bold mb-3">The two rules that make the ladder honest</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-[var(--color-accent-amber)] mb-1">1. A failed recall demotes.</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Revised drops to Solved. Solved drops to Attempted. Levels are a current claim about your ability,
                  not a record of past achievement. Refusing to demote is exactly how a tracker showing 111 solved
                  ends up reporting 14% mastery.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-accent-amber)] mb-1">2. Mastered requires the mixed-set pass.</p>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Not just a clean re-solve. A problem you solved while knowing it was a Heap problem is not evidence
                  you would recognise it as a Heap problem in an OA. Those are different skills.
                </p>
              </div>
            </div>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-3">The spaced schedule</h3>
            <div className="space-y-2">
              {SCHEDULE.map((s) => (
                <div key={s.when} className="glass-row rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3 mb-0.5">
                    <span className="text-xs font-mono font-bold text-[#22d3ee] w-16 shrink-0">{s.when}</span>
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{s.action}</span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed sm:pl-[76px]">{s.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-3 leading-relaxed">
              The app runs a forgiving version of this: intervals are anchored to the date you actually
              revised, so a missed day shifts the chain forward instead of bunching up.
            </p>
          </div>
        </div>
      )}

      {/* ── REPAIR ── */}
      {tab === "repair" && (
        <div className="space-y-4">
          <Callout accent="#fb923c">
            When a recall fails, ask one question before doing anything:
            <strong className="text-[var(--color-text-primary)]"> is the PATTERN gone, or just this problem&apos;s twist?</strong>{" "}
            The answer changes the entire repair method, and getting it wrong is expensive.
          </Callout>

          <div className="section-card p-5" style={{ borderColor: "rgba(239,68,68,0.28)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#f87171", background: "rgba(239,68,68,0.16)" }}>CASE A</span>
              <h3 className="text-sm font-bold">The pattern concept itself is gone</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              You read the title and cannot remember what a monotonic stack is or why it works. The problem is not
              the memory of this problem; it is the machinery underneath it.{" "}
              <strong className="text-[var(--color-text-primary)]">Do NOT re-solve problems one at a time — that is the expensive mistake.</strong>
            </p>
            <ol className="space-y-1.5 mb-3">
              {[
                "Rebuild the concept once — 20–30 min. Your notes or the pattern video. This is the one time notes are open first.",
                "Write the template from memory on paper. Bare skeleton, nothing else. If you can't write it, step 1 isn't finished.",
                "Solve 2–3 CORE problems from that pattern back to back, cold, in ONE session. Not spread across days — the consolidation comes from doing them consecutively.",
                "The rest of the pattern's problems get a recall pass a few days later. They'll mostly pass now, because the concept underneath has been restored.",
              ].map((s, i) => (
                <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex gap-2">
                  <span className="font-mono shrink-0 text-[#f87171]">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-[var(--color-text-muted)] italic leading-relaxed pt-2.5 border-t border-[var(--color-border-subtle)]">
              One pattern repair takes ~90 minutes and restores 8–20 problems simultaneously. Repairing those same
              problems individually would cost five hours and work worse.
            </p>
          </div>

          <div className="section-card p-5" style={{ borderColor: "rgba(16,185,129,0.28)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "#34d399", background: "rgba(16,185,129,0.16)" }}>CASE B</span>
              <h3 className="text-sm font-bold">The pattern is intact, this problem&apos;s twist is gone</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              You know monotonic stack fine; you just don&apos;t remember the 2n iteration trick in Next Greater Element II.
              Nothing structural is broken. Straight to <strong className="text-[var(--color-text-primary)]">Mode 3 — cold re-solve</strong>,
              20-minute timebox, notes closed. Apply the escape procedure if you hit the timebox.
              This is the cheap case: 20 minutes, one problem.
            </p>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">Measure it in patterns, not problems</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Expect Case A to dominate early — decay sits at the concept layer, not the detail layer. That is
              genuinely good news: pattern-level repair has by far the better cost-per-problem-restored. The
              situation looks worse than it is because you are measuring it in problems when you should be
              measuring it in patterns — <strong className="text-[var(--color-text-primary)]">15 patterns, not 175 problems</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── INTERLEAVING ── */}
      {tab === "mixed" && (
        <div className="space-y-4">
          <Callout accent="#38bdf8">
            An OA gives you random problems, not a labelled pattern set. Blocked practice builds the ability to
            solve a problem you already know the category of.
            <strong className="text-[var(--color-text-primary)]"> It does not build the ability to categorise. Only the second is tested.</strong>
          </Callout>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">Expect it to feel like regression</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Interleaved practice is measurably worse-feeling and measurably better-performing. You will solve
              fewer problems per hour and get more of them right when it counts.{" "}
              <strong className="text-[var(--color-text-primary)]">It is not regression.</strong>
            </p>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-3">The weekly mixed set</h3>
            <ul className="space-y-1.5">
              {[
                "Pick 3 problems at random from patterns already repaired. Do not look at the pattern tag first.",
                "75 minutes total, timed, one sitting, no editorials, no notes.",
                "Before writing any code, write down which pattern you think it is and why. Then solve. Then check whether your call was right.",
                "Score two separate things: how many you solved, and how many you correctly classified. The second matters more early on.",
                "Any problem you misclassified is demoted regardless of whether you eventually solved it. Misclassification is the failure mode that ends OAs.",
              ].map((s, i) => (
                <li key={i} className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex gap-2">
                  <span className="text-[#38bdf8] shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <Link href="/revision/test" className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg,#38bdf8,#4f8cff)" }}>
              <Shuffle className="w-3.5 h-3.5" /> Take the interleaved test
            </Link>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">Contests deserve a specific note</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Practice pressure and interview pressure are different physiological states. A weekly contest is the
              only cheap way to train the second one. Your rating is irrelevant — the point is exposure to
              unfamiliar problems under a clock. Start these in October at the latest.
            </p>
          </div>
        </div>
      )}

      {/* ── RULES & HABITS ── */}
      {tab === "habits" && (
        <div className="space-y-4">
          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-[var(--color-accent-purple)]" /> Why any of this
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              <strong className="text-[var(--color-text-primary)]">A problem you cannot re-solve cold is worth zero. Not partial credit. Zero.</strong>{" "}
              Nobody asks how many problems you have solved. They hand you one problem and watch.
            </p>
            <div className="space-y-2">
              {YIELD.map((y) => (
                <div key={y.activity} className="glass-row rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{y.activity}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: y.color, background: `${y.color}22` }}>
                      {y.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    <span className="font-mono">{y.cost}</span> · {y.yield}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">The mistake log</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Highest-ROI habit in placement prep; costs two minutes a day. Every time you fail — a failed recall,
              a wrong answer, a bug that cost fifteen minutes, an editorial you had to open — write one entry.
            </p>
            <div className="space-y-1.5 mb-3">
              {MISTAKE_FIELDS.map((f) => (
                <div key={f.field} className="glass-row rounded-lg px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">{f.field}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{f.example}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mb-3">
              The <strong className="text-[var(--color-text-primary)]">category</strong> field is what pays off. After thirty entries your
              failures will visibly cluster — off-by-one in boundary binary search, forgetting to seed a HashMap,
              null-checks on linked lists. Fixing three recurring categories is worth more than fifty new problems.
              Read the whole log the night before every OA and every interview.
            </p>
            <Link href="/revision/mistakes" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "linear-gradient(90deg,#f59e0b,#d97706)" }}>
              Open the log
            </Link>
          </div>

          <div className="section-card p-5">
            <h3 className="text-sm font-bold mb-2">Notes hygiene</h3>
            <ul className="space-y-2">
              {[
                ["Your notes should get shorter every pass.", "First revision: three screenshots and a dry run. Third: three lines. If a note still needs a full screenshot on the fourth pass, you've stored the idea rather than compressed it — and compression IS the understanding. Rewrite each note, shorter, on the day you successfully recall it."],
                ["Dry runs should be produced, not read.", "During recall on the trickier problems: state the insight, then trace it on a 4-element example in your head BEFORE opening the note. Matching output is a far stronger pass than merely naming the pattern."],
                ["Move code out of screenshots.", "Screenshots can't be run, diffed, or searched. Keep insight and dry runs on the iPad — that's the right place — but push actual solutions to GitHub or rely on LeetCode submission history."],
              ].map(([h, b]) => (
                <li key={h}>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">{h}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-0.5">{b}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="section-card p-5" style={{ borderColor: "rgba(239,68,68,0.28)" }}>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#f87171]" /> The hard rule on new sheets
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
              Do not open a new sheet while any pattern in your current sheet is still unrepaired. Adding sources
              feels like progress and is usually avoidance — it converts an uncomfortable retention problem into a
              comfortable acquisition problem.
            </p>
            <div className="space-y-2">
              {SHEETS.map((s) => (
                <div key={s.source} className="glass-row rounded-lg px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{s.source}</span>
                    {s.note && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={
                          s.note === "Your current call"
                            ? { color: "#34d399", background: "rgba(16,185,129,0.16)" }
                            : { color: "#6b6b7a", background: "rgba(255,255,255,0.06)" }
                        }
                      >
                        {s.note.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#7ba9ff] mb-1">{s.when}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{s.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Callout({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      className="rounded-2xl p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]"
      style={{ background: `${accent}14`, border: `1px solid ${accent}44` }}
    >
      {children}
    </div>
  );
}
