"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Activity, HeartPulse, Zap, Shuffle } from "lucide-react";

interface HealthRow {
  id: string;
  name: string;
  order: number;
  health: number;
  mastery: number;
  recognition: number | null;
  recognitionAttempts: number;
  daysSincePractice: number | null;
  revFailCount: number;
  problemCount: number;
  solvedCount: number;
}

interface Recognition {
  total: number;
  accuracy: number | null;
  weak: { name: string; missRate: number }[];
}

function band(h: number): { color: string; bg: string; label: string } {
  if (h >= 80) return { color: "#34d399", bg: "rgba(16,185,129,0.16)", label: "Healthy" };
  if (h >= 60) return { color: "#fbbf24", bg: "rgba(245,158,11,0.16)", label: "Watch" };
  if (h >= 40) return { color: "#fb923c", bg: "rgba(249,115,22,0.16)", label: "Decaying" };
  return { color: "#f87171", bg: "rgba(239,68,68,0.16)", label: "Critical" };
}

export function StatsClient({
  health,
  recognition,
  testAccuracy,
  avgHealth,
  lastTestAt,
}: {
  health: HealthRow[];
  recognition: Recognition;
  testAccuracy: number | null;
  avgHealth: number;
  lastTestAt: string | null;
}) {
  const critical = health.filter((h) => h.health < 40).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/revision" className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
        <ArrowLeft className="w-3.5 h-3.5" /> Revision Corner
      </Link>

      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <Activity className="w-3.5 h-3.5 text-[var(--color-accent-emerald)]" />
          Retention diagnostics
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Pattern Health</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-2xl">
          Not &quot;how many did I solve&quot; — how much would survive a cold test today. Weakest first.
        </p>
      </div>

      {/* Headline tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile icon={HeartPulse} label="Avg health" value={`${avgHealth}`} suffix="/100" color="#34d399" />
        <Tile icon={Zap} label="Recognition 30d" value={recognition.accuracy !== null ? `${recognition.accuracy}` : "—"} suffix={recognition.accuracy !== null ? "%" : ""} color="#a855f7" sub={`${recognition.total} reps`} />
        <Tile icon={Shuffle} label="Interleaved 30d" value={testAccuracy !== null ? `${testAccuracy}` : "—"} suffix={testAccuracy !== null ? "%" : ""} color="#38bdf8" sub={lastTestAt ? formatDistanceToNow(new Date(lastTestAt), { addSuffix: true }) : "never taken"} />
        <Tile icon={Activity} label="Critical patterns" value={`${critical}`} color={critical > 0 ? "#f87171" : "#34d399"} sub="below 40" />
      </div>

      {/* Health table */}
      <div>
        <h2 className="text-lg font-bold mb-3">Every pattern, weakest first</h2>
        <div className="space-y-2">
          {health.map((h) => {
            const b = band(h.health);
            return (
              <div key={h.id} className="section-card p-4">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-xs font-mono font-bold text-[var(--color-accent-purple)] shrink-0">
                    #{String(h.order).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] flex-1 min-w-0 truncate">
                    {h.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ color: b.color, background: b.bg }}>
                    {b.label}
                  </span>
                  <span className="text-lg font-bold font-mono shrink-0 w-10 text-right" style={{ color: b.color }}>
                    {h.health}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mb-2.5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${h.health}%`, background: b.color }} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
                  <span>
                    Mastery <span className="font-mono text-[var(--color-text-secondary)]">{h.mastery}%</span>
                  </span>
                  <span>
                    Recognition{" "}
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {h.recognition !== null ? `${h.recognition}%` : "no data"}
                    </span>
                    {h.recognitionAttempts > 0 && ` (${h.recognitionAttempts})`}
                  </span>
                  <span>
                    Practiced{" "}
                    <span className="font-mono text-[var(--color-text-secondary)]">
                      {h.daysSincePractice !== null ? `${h.daysSincePractice}d ago` : "never"}
                    </span>
                  </span>
                  <span>
                    Solved <span className="font-mono text-[var(--color-text-secondary)]">{h.solvedCount}/{h.problemCount}</span>
                  </span>
                  {h.revFailCount > 0 && (
                    <span className="text-[var(--color-accent-amber)]">shaky ×{h.revFailCount}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
        Health = mastery (the honest ladder, which already counts unsolved problems as zero),
        decayed by how long since you last practiced the pattern, blended with your drill/test
        recognition accuracy, minus a penalty for recent &quot;shaky&quot; verdicts.
      </p>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  suffix?: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="section-card p-4">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="eyebrow">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
        {suffix && <span className="text-sm text-[var(--color-text-muted)]">{suffix}</span>}
      </p>
      {sub && <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}
