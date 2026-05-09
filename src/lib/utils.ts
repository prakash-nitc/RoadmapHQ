import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate pattern completion percentage
 * Formula: 40% video progress + 60% problem progress
 */
export function calcPatternCompletion(
  completedVideos: number,
  totalVideos: number,
  completedProblems: number,
  totalProblems: number
): number {
  const videoProgress = totalVideos > 0 ? completedVideos / totalVideos : 0;
  const problemProgress =
    totalProblems > 0 ? completedProblems / totalProblems : 0;
  return Math.round((videoProgress * 40 + problemProgress * 60) * 100) / 100;
}

/**
 * Calculate mastery score based on revision count
 * Solved: +20, Each revision: +20, max 100
 */
export function calcMasteryScore(revisionLevel: number): number {
  // Level 0 = not solved, Level 1 = solved (+20), Level 2-5 = revisions (+20 each)
  return Math.min(revisionLevel * 20, 100);
}

/**
 * Get the next revision date based on current revision number
 * Schedule: 3, 7, 14, 30, 60 days
 */
export function getNextRevisionDate(
  solvedDate: Date,
  revisionNumber: number
): Date | null {
  const intervals = [3, 7, 14, 30, 60];
  if (revisionNumber > intervals.length) return null;

  const totalDays = intervals
    .slice(0, revisionNumber)
    .reduce((sum, d) => sum + d, 0);

  const nextDate = new Date(solvedDate);
  nextDate.setDate(nextDate.getDate() + totalDays);
  return nextDate;
}

/**
 * Calculate mission score for a day
 */
export function calcMissionScore(
  targetVideos: number,
  completedVideos: number,
  targetProblems: number,
  completedProblems: number,
  targetStudyMins: number,
  completedStudyMins: number
): number {
  const videoScore =
    targetVideos > 0
      ? Math.min(completedVideos / targetVideos, 1) * 33.33
      : 33.33;
  const problemScore =
    targetProblems > 0
      ? Math.min(completedProblems / targetProblems, 1) * 33.33
      : 33.33;
  const studyScore =
    targetStudyMins > 0
      ? Math.min(completedStudyMins / targetStudyMins, 1) * 33.34
      : 33.34;

  return Math.round(videoScore + problemScore + studyScore);
}

/**
 * Format minutes into human readable duration
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Get status color for problem status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "NOT_STARTED":
      return "text-zinc-500";
    case "ATTEMPTED":
      return "text-amber-400";
    case "SOLVED":
      return "text-blue-400";
    case "REVISED":
      return "text-purple-400";
    case "MASTERED":
      return "text-emerald-400";
    default:
      return "text-zinc-500";
  }
}

/**
 * Get status badge variant
 */
export function getStatusBadge(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "NOT_STARTED":
      return {
        label: "Not Started",
        className: "bg-zinc-800 text-zinc-400 border-zinc-700",
      };
    case "ATTEMPTED":
      return {
        label: "Attempted",
        className: "bg-amber-950 text-amber-400 border-amber-800",
      };
    case "SOLVED":
      return {
        label: "Solved",
        className: "bg-blue-950 text-blue-400 border-blue-800",
      };
    case "REVISED":
      return {
        label: "Revised",
        className: "bg-purple-950 text-purple-400 border-purple-800",
      };
    case "MASTERED":
      return {
        label: "Mastered",
        className: "bg-emerald-950 text-emerald-400 border-emerald-800",
      };
    default:
      return {
        label: status,
        className: "bg-zinc-800 text-zinc-400 border-zinc-700",
      };
  }
}
