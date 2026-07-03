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
} from "lucide-react";
import { toggleVideoWatched, updateProblemStatus, savePatternNotes } from "@/lib/actions";
import { getStatusBadge } from "@/lib/utils";

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
  { key: "videos", label: "Videos", icon: PlayCircle },
  { key: "problems", label: "Problems", icon: Code2 },
  { key: "notes", label: "Notes", icon: BookOpen },
] as const;

type Tab = (typeof tabs)[number]["key"];

export function PatternDetailClient({ pattern }: { pattern: SerializedPattern }) {
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const totalVids = pattern.videos.length;
  const totalProbs = pattern.problems.length;
  const videoProgress = totalVids > 0 ? pattern.watchedVids / totalVids : 0;
  const problemProgress = totalProbs > 0 ? pattern.solvedProbs / totalProbs : 0;
  const completion = Math.round((videoProgress * 40 + problemProgress * 60) * 100) / 100;

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

  // Notes consolidated into a single field. Older split fields (mistakes,
  // revisionNotes) are merged on first load so nothing is lost.
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
      // Write everything to keyLearnings and clear the legacy fields.
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

  const getDifficultyColor = (d: string | null) => {
    switch (d) {
      case "EASY": return "text-emerald-400 bg-emerald-950 border-emerald-800";
      case "MEDIUM": return "text-amber-400 bg-amber-950 border-amber-800";
      case "HARD": return "text-red-400 bg-red-950 border-red-800";
      default: return "text-zinc-400 bg-zinc-900 border-zinc-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/patterns"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Patterns
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-[var(--color-text-muted)]">
                #{pattern.order}
              </span>
              <h1 className="text-2xl font-bold">{pattern.name}</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
              {pattern.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-[var(--color-accent-blue)]">
              {completion}%
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">Completion</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          <div className="section-card p-4 text-center">
            <div className="text-xl font-bold font-mono text-[var(--color-accent-purple)]">
              {pattern.watchedVids}/{totalVids}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mt-1">Videos</div>
          </div>
          <div className="section-card p-4 text-center">
            <div className="text-xl font-bold font-mono text-[var(--color-accent-emerald)]">
              {pattern.solvedProbs}/{totalProbs}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mt-1">Problems</div>
          </div>
          <div className="section-card p-4 text-center">
            <div className="text-xl font-bold font-mono text-[var(--color-accent-amber)]">
              {totalProbs > 0
                ? Math.round(pattern.problems.reduce((s, p) => s + p.masteryScore, 0) / totalProbs)
                : 0}
              %
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mt-1">Mastery</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs font-mono ml-1 opacity-60">
                {tab.key === "videos" ? totalVids : tab.key === "problems" ? totalProbs : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "videos" && (
        <div className="space-y-2">
          {pattern.videos.map((video) => {
            const watchUrl =
              video.url ??
              `https://www.youtube.com/results?search_query=${encodeURIComponent(
                "Padho with Pratyush " + video.title
              )}`;
            return (
              <div
                key={video.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  video.watched
                    ? "bg-[var(--color-accent-emerald-dim)]/20 border border-emerald-800/40"
                    : "glass-row hover:!border-[var(--color-accent-purple)]/50"
                }`}
              >
                <button
                  onClick={() => handleToggleVideo(video.id)}
                  disabled={isPending}
                  className="shrink-0"
                  aria-label={video.watched ? "Mark unwatched" : "Mark watched"}
                >
                  {video.watched ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-emerald)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-text-muted)] hover:text-[var(--color-accent-purple)]" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      video.watched
                        ? "text-[var(--color-text-muted)] line-through"
                        : "text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span className="font-mono text-xs text-[var(--color-text-muted)] mr-2">
                      Ep {video.episodeNumber}
                    </span>
                    {video.title}
                  </p>
                </div>
                {video.duration && (
                  <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0">
                    {video.duration}
                  </span>
                )}
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--color-accent-purple-dim)]/40 text-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-dim)]/70 transition-colors shrink-0"
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

      {activeTab === "problems" && (
        <div className="space-y-2">
          {pattern.problems.map((problem) => {
            const badge = getStatusBadge(problem.status);
            return (
              <div
                key={problem.id}
                className="glass-row flex items-center gap-3 p-3 rounded-lg hover:!border-[var(--color-accent-blue)]/50"
              >
                {/* Status selector */}
                <select
                  value={problem.status}
                  onChange={(e) => handleProblemStatus(problem.id, e.target.value)}
                  disabled={isPending}
                  className="bg-transparent text-xs font-medium px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] cursor-pointer"
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="ATTEMPTED">Attempted</option>
                  <option value="SOLVED">Solved</option>
                  <option value="REVISED">Revised</option>
                  <option value="MASTERED">Mastered</option>
                </select>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {problem.title}
                    </p>
                    {problem.isChallenge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                        Challenge
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {problem.difficulty && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {problem.platform}
                    </span>
                    {problem.subPattern && (
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        · {problem.subPattern}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mastery */}
                <div className="shrink-0 text-right mr-2">
                  <div className="text-xs font-mono text-[var(--color-text-muted)]">
                    {problem.masteryScore}%
                  </div>
                </div>

                {/* External link */}
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded hover:bg-[var(--color-bg-elevated)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="section-card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
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
              <span className="text-xs text-[var(--color-accent-emerald)]">
                ✓ Saved
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              disabled={isPending}
              className="px-4 py-2 bg-[var(--color-accent-blue)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
