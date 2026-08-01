"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PlayCircle,
  Code2,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Search,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import { toggleVideoWatched, updateProblemStatus, savePatternNotes } from "@/lib/actions";

interface SerializedPattern {
  id: string;
  name: string;
  description: string | null;
  order: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  watchedVids: number;
  solvedProbs: number;
  videos: {
    id: string;
    episodeNumber: number;
    title: string;
    duration: string | null;
    url: string | null;
    watched: boolean;
    watchedAt: string | null;
    notes: string | null;
  }[];
  problems: {
    id: string;
    title: string;
    difficulty: string | null;
    platform: string;
    url: string;
    status: string;
    attempts: number;
    solvedAt: string | null;
    masteryScore: number;
    subPattern: string | null;
    isChallenge: boolean;
    isHomework: boolean;
  }[];
  notes: {
    id: string;
    patternId: string;
    keyLearnings: string | null;
    mistakes: string | null;
    revisionNotes: string | null;
  } | null;
}

const tabs = [
  { key: "videos", label: "Videos", icon: PlayCircle, color: "var(--color-accent-purple)" },
  { key: "problems", label: "Problems", icon: Code2, color: "var(--color-accent-blue)" },
  { key: "notes", label: "Notes", icon: BookOpen, color: "var(--color-accent-emerald)" },
] as const;

type Tab = (typeof tabs)[number]["key"];

const STATUS_META: Record<
  string,
  { label: string; color: string; rail: string }
> = {
  NOT_STARTED: { label: "Not started", color: "#6b6b7a", rail: "transparent" },
  ATTEMPTED: { label: "Attempted", color: "#f59e0b", rail: "#f59e0b" },
  SOLVED: { label: "Solved", color: "#4f8cff", rail: "#4f8cff" },
  REVISED: { label: "Revised", color: "#a855f7", rail: "#a855f7" },
  MASTERED: { label: "Mastered", color: "#10b981", rail: "#10b981" },
};

function platformStyle(platform: string) {
  const p = platform.toUpperCase();
  if (p === "LEETCODE")
    return { label: "LeetCode", color: "#ffa116", bg: "rgba(255,161,22,0.12)" };
  if (p === "GFG" || p === "GEEKSFORGEEKS")
    return { label: "GfG", color: "#43a047", bg: "rgba(67,160,71,0.14)" };
  return { label: platform, color: "#9ca3af", bg: "rgba(156,163,175,0.12)" };
}

function difficultyStyle(d: string | null) {
  switch (d) {
    case "EASY": return { label: "Easy", color: "#10b981", bg: "rgba(16,185,129,0.14)" };
    case "MEDIUM": return { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.14)" };
    case "HARD": return { label: "Hard", color: "#ef4444", bg: "rgba(239,68,68,0.14)" };
    default: return null;
  }
}

export function PatternDetailClient({ pattern }: { pattern: SerializedPattern }) {
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const totalVids = pattern.videos.length;
  const totalProbs = pattern.problems.length;
  const videoProgress = totalVids > 0 ? pattern.watchedVids / totalVids : 0;
  const problemProgress = totalProbs > 0 ? pattern.solvedProbs / totalProbs : 0;
  const completion = Math.round((videoProgress * 40 + problemProgress * 60) * 100) / 100;
  const avgMastery =
    totalProbs > 0
      ? Math.round(pattern.problems.reduce((s, p) => s + p.masteryScore, 0) / totalProbs)
      : 0;

  const handleToggleVideo = (videoId: string) => {
    startTransition(async () => {
      await toggleVideoWatched(videoId);
      router.refresh();
    });
  };

  const handleProblemStatus = (problemId: string, status: string) => {
    startTransition(async () => {
      await updateProblemStatus(problemId, status);
      router.refresh();
    });
  };

  const initialNotes = (() => {
    const parts: string[] = [];
    if (pattern.notes?.keyLearnings) parts.push(pattern.notes.keyLearnings);
    if (pattern.notes?.mistakes) parts.push("Mistakes:\n" + pattern.notes.mistakes);
    if (pattern.notes?.revisionNotes) parts.push("Revision:\n" + pattern.notes.revisionNotes);
    return parts.join("\n\n");
  })();
  const [notesValue, setNotesValue] = useState(initialNotes);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSaveNotes = () => {
    startTransition(async () => {
      await savePatternNotes(pattern.id, {
        keyLearnings: notesValue,
        mistakes: "",
        revisionNotes: "",
      });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
      router.refresh();
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/patterns"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All patterns
      </Link>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,140,255,0.12), rgba(168,85,247,0.10) 55%, rgba(16,185,129,0.06)), rgba(20,20,30,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px -20px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                style={{ background: "rgba(168,85,247,0.18)", color: "#c084fc" }}
              >
                #{String(pattern.order).padStart(2, "0")}
              </span>
              <span className="eyebrow">Pattern</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-[#dbe4ff] to-[#e9d5ff] bg-clip-text text-transparent">
              {pattern.name}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-xl leading-relaxed">
              {pattern.description}
            </p>
          </div>

          {/* Completion ring */}
          <CompletionRing percent={completion} />
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-7">
          <StatPill
            icon={PlayCircle}
            label="Videos"
            done={pattern.watchedVids}
            total={totalVids}
            color="#a855f7"
          />
          <StatPill
            icon={Code2}
            label="Problems"
            done={pattern.solvedProbs}
            total={totalProbs}
            color="#4f8cff"
          />
          <StatPill
            icon={Award}
            label="Mastery"
            percent={avgMastery}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* ─── Pill tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 rounded-full glass-input w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = tab.key === "videos" ? totalVids : tab.key === "problems" ? totalProbs : null;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "text-white shadow-lg"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(90deg, ${tab.color}, ${tab.color}bb)`,
                      boxShadow: `0 4px 16px -4px ${tab.color}80`,
                    }
                  : undefined
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count !== null && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Videos ───────────────────────────────────────────── */}
      {activeTab === "videos" && (
        <div className="space-y-2.5">
          {pattern.videos.map((video) => {
            const watchUrl =
              video.url ??
              `https://www.youtube.com/results?search_query=${encodeURIComponent(
                "Padho with Pratyush " + video.title
              )}`;
            return (
              <div
                key={video.id}
                className="group relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl overflow-hidden transition-all"
                style={{
                  background: video.watched
                    ? "linear-gradient(90deg, rgba(16,185,129,0.10), rgba(16,185,129,0.02))"
                    : "rgba(255,255,255,0.028)",
                  border: `1px solid ${video.watched ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {/* Left rail */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: video.watched ? "#10b981" : "rgba(168,85,247,0.5)" }}
                />

                <button
                  onClick={() => handleToggleVideo(video.id)}
                  disabled={isPending}
                  className="shrink-0 transition-transform hover:scale-110"
                  aria-label={video.watched ? "Mark unwatched" : "Mark watched"}
                >
                  {video.watched ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-emerald)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-purple)]" />
                  )}
                </button>

                <span
                  className="shrink-0 text-[11px] font-mono font-bold px-2 py-1 rounded-md"
                  style={{ background: "rgba(168,85,247,0.14)", color: "#c084fc" }}
                >
                  EP {video.episodeNumber}
                </span>

                <p
                  className={`flex-1 min-w-0 text-sm font-medium truncate ${
                    video.watched
                      ? "text-[var(--color-text-muted)] line-through decoration-1"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {video.title}
                </p>

                {video.duration && (
                  <span className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[11px] font-mono text-[var(--color-text-muted)] px-2 py-1 rounded-md bg-[rgba(255,255,255,0.04)]">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </span>
                )}

                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shrink-0 transition-transform hover:scale-105"
                  style={{
                    background: "linear-gradient(90deg, #a855f7, #7c3aed)",
                    boxShadow: "0 4px 14px -4px rgba(168,85,247,0.6)",
                  }}
                  title={video.url ? "Open in YouTube" : "Search YouTube"}
                >
                  {video.url ? <ExternalLink className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                  {video.url ? "Watch" : "Find"}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Problems ─────────────────────────────────────────── */}
      {activeTab === "problems" && (
        <div className="space-y-2.5">
          {pattern.problems.map((problem) => {
            const meta = STATUS_META[problem.status] ?? STATUS_META.NOT_STARTED;
            const plat = platformStyle(problem.platform);
            const diff = difficultyStyle(problem.difficulty);
            const solved = ["SOLVED", "REVISED", "MASTERED"].includes(problem.status);
            return (
              <div
                key={problem.id}
                className="group relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl overflow-hidden transition-all hover:border-[rgba(255,255,255,0.12)]"
                style={{
                  background: solved
                    ? `linear-gradient(90deg, ${meta.color}12, transparent 60%)`
                    : "rgba(255,255,255,0.028)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Status left rail */}
                <span
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: meta.rail }}
                />

                {/* Status select — colored */}
                <select
                  value={problem.status}
                  onChange={(e) => handleProblemStatus(problem.id, e.target.value)}
                  disabled={isPending}
                  className="glass-select shrink-0 text-[11px] font-semibold pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer border"
                  style={{
                    color: meta.color,
                    borderColor: `${meta.color}55`,
                    background: `${meta.color}14`,
                  }}
                >
                  <option value="NOT_STARTED">Not started</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="SOLVED">Solved</option>
                  <option value="REVISED">Revised</option>
                  <option value="MASTERED">Mastered</option>
                </select>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                      {problem.title}
                    </p>
                    {problem.isChallenge && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: "rgba(168,85,247,0.16)", color: "#c084fc" }}
                      >
                        <Zap className="w-2.5 h-2.5" /> CHALLENGE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {diff && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color: diff.color, background: diff.bg }}
                      >
                        {diff.label}
                      </span>
                    )}
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: plat.color, background: plat.bg }}
                    >
                      {plat.label}
                    </span>
                    {problem.subPattern && (
                      <span className="text-[10px] text-[var(--color-text-muted)] truncate">
                        {problem.subPattern}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mastery mini bar */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-20">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: problem.masteryScore > 0 ? meta.color : "var(--color-text-muted)" }}
                  >
                    {problem.masteryScore}%
                  </span>
                  <div className="w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${problem.masteryScore}%`,
                        background: meta.color,
                        boxShadow: problem.masteryScore > 0 ? `0 0 6px ${meta.color}80` : "none",
                      }}
                    />
                  </div>
                </div>

                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                  title="Open problem"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Notes ────────────────────────────────────────────── */}
      {activeTab === "notes" && (
        <div className="section-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              Pattern notes
            </label>
            <p className="text-xs text-[var(--color-text-muted)] mb-3">
              Key learnings, common mistakes, anything to remember next time.
            </p>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="What clicked? What tripped you up? Quick template snippets..."
              rows={12}
              className="glass-input w-full rounded-lg p-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors resize-y font-mono leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            {savedFlash && (
              <span className="text-xs text-[var(--color-accent-emerald)] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              disabled={isPending}
              className="px-4 py-2 bg-gradient-to-r from-[var(--color-accent-emerald)] to-[#059669] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {isPending ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CompletionRing({ percent }: { percent: number }) {
  const size = 118;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0 mx-auto sm:mx-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#pd-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * (percent / 100)} ${circ}`}
          style={{ filter: "drop-shadow(0 0 10px rgba(79,140,255,0.5))", transition: "stroke-dasharray 0.8s ease" }}
        />
        <defs>
          <linearGradient id="pd-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f8cff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono bg-gradient-to-r from-[#4f8cff] to-[#a855f7] bg-clip-text text-transparent">
          {Math.round(percent)}
          <span className="text-sm">%</span>
        </span>
        <span className="eyebrow mt-0.5">Done</span>
      </div>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  done,
  total,
  percent,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  done?: number;
  total?: number;
  percent?: number;
  color: string;
}) {
  const pct =
    percent !== undefined
      ? percent
      : total && total > 0
      ? Math.round(((done ?? 0) / total) * 100)
      : 0;

  return (
    <div
      className="rounded-xl p-3.5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}18, transparent 70%), rgba(255,255,255,0.02)`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: `${color}22` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="eyebrow">{label}</span>
      </div>
      <div className="text-lg font-bold font-mono" style={{ color }}>
        {percent !== undefined ? `${percent}%` : `${done}/${total}`}
      </div>
      <div className="mt-2 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}80` }}
        />
      </div>
    </div>
  );
}
