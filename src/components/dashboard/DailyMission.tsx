"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  Code2,
  RotateCcw,
  CheckSquare,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { toggleVideoWatched } from "@/lib/actions";

interface NextVideo {
  id: string;
  episodeNumber: number;
  title: string;
  patternName: string;
  url: string | null;
}

interface TodayLog {
  targetVideos: number;
  targetProblems: number;
  targetStudyMins: number;
  completedVideos: number;
  completedProblems: number;
  completedStudyMins: number;
  missionScore: number;
}

interface DailyMissionProps {
  nextVideo: NextVideo | null;
  todayLog: TodayLog | null;
  revisionsDue: number;
  revisionsDone: number;
  embedded?: boolean;
}

function ytSearch(title: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    "Padho with Pratyush " + title
  )}`;
}

export function DailyMission({
  nextVideo,
  todayLog,
  revisionsDue,
  revisionsDone,
  embedded = false,
}: DailyMissionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const targetVideos = todayLog?.targetVideos ?? 2;
  const targetProblems = todayLog?.targetProblems ?? 3;
  const doneVideos = todayLog?.completedVideos ?? 0;
  const doneProblems = todayLog?.completedProblems ?? 0;
  const totalRevs = revisionsDue + revisionsDone;

  const handleWatch = () => {
    if (!nextVideo) return;
    window.open(
      nextVideo.url ?? ytSearch(nextVideo.title),
      "_blank",
      "noopener,noreferrer"
    );
    startTransition(async () => {
      await toggleVideoWatched(nextVideo.id);
      router.refresh();
    });
  };

  const tasks = [
    {
      key: "video",
      icon: PlayCircle,
      label: "Watch",
      done: doneVideos,
      target: targetVideos,
      unit: "videos",
      color: "var(--color-accent-purple)",
      inlineAction: nextVideo
        ? { label: nextVideo.url ? "Watch on YouTube" : "Find on YouTube", onClick: handleWatch }
        : undefined,
    },
    {
      key: "problem",
      icon: Code2,
      label: "Solve",
      done: doneProblems,
      target: targetProblems,
      unit: "problems",
      color: "var(--color-accent-emerald)",
      link: "/problems",
    },
    // Revise: if nothing is due today, this row is auto-complete (you
    // can't fail what doesn't exist). The progress bar shows full + done.
    totalRevs > 0
      ? {
          key: "revise",
          icon: RotateCcw,
          label: "Revise",
          done: revisionsDone,
          target: totalRevs,
          unit: "problems",
          color: "var(--color-accent-amber)",
          link: revisionsDue > 0 ? "/revision" : undefined,
        }
      : {
          key: "revise",
          icon: RotateCcw,
          label: "Revise",
          done: 1,
          target: 1,
          unit: "",
          color: "var(--color-accent-amber)",
          emptyLabel: "Nothing due today",
        },
  ];

  return (
    <div className={embedded ? "" : "section-card overflow-hidden"}>
      <div className="px-7 pt-7 pb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Today&apos;s mission
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Knock these out — that&apos;s the day won.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold whitespace-nowrap shrink-0 pt-1">
          Daily directive
        </span>
      </div>

      <div className="px-7 pb-8 space-y-7">
        {tasks.map((t) => {
          const pct = Math.min((t.done / Math.max(t.target, 1)) * 100, 100);
          const isDone = t.done >= t.target;
          const Icon = t.icon;
          const emptyLabel = "emptyLabel" in t ? t.emptyLabel : undefined;

          return (
            <div key={t.key} className="group">
              <div className="flex items-center gap-3 mb-1.5">
                {/* Checkbox-style icon */}
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isDone
                      ? "var(--color-accent-emerald)"
                      : t.color + "22",
                    border: `1.5px solid ${
                      isDone ? "var(--color-accent-emerald)" : t.color + "55"
                    }`,
                  }}
                >
                  {isDone ? (
                    <CheckSquare className="w-3 h-3 text-white" strokeWidth={3} />
                  ) : (
                    <Icon className="w-3 h-3" style={{ color: t.color }} />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium flex-1 ${
                    isDone
                      ? "text-[var(--color-text-muted)] line-through decoration-1"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {t.label}
                </span>

                {/* Inline action (e.g., Watch on YouTube) */}
                {t.inlineAction && !isDone && (
                  <button
                    onClick={t.inlineAction.onClick}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: t.color + "26",
                      color: t.color,
                    }}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    {t.inlineAction.label}
                  </button>
                )}
                {t.link && !isDone && (
                  <Link
                    href={t.link}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md transition-colors"
                    style={{
                      backgroundColor: t.color + "26",
                      color: t.color,
                    }}
                  >
                    Open
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                )}

                {/* Count (or "Nothing due" for the no-target case) */}
                {emptyLabel ? (
                  <span className="text-xs italic text-[var(--color-text-muted)] shrink-0">
                    {emptyLabel}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[var(--color-text-muted)] shrink-0 w-24 text-right">
                    <span style={{ color: t.color }}>{Math.round(pct)}%</span>
                    <span className="opacity-60">
                      {" "}
                      / {t.target} {t.unit}
                    </span>
                  </span>
                )}
              </div>

              {/* Thin progress bar */}
              <div className="h-1 rounded-full bg-[var(--color-bg-primary)]/60 overflow-hidden ml-8">
                <div
                  className="h-full rounded-full progress-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: isDone
                      ? "var(--color-accent-emerald)"
                      : `linear-gradient(90deg, ${t.color}, ${t.color}cc)`,
                    boxShadow: `0 0 8px ${t.color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
