"use client";

import { useState, useEffect, useTransition } from "react";
import { PlayCircle, CheckCircle2, Circle, Search, ExternalLink, Link2, Pencil } from "lucide-react";
import { getVideos, toggleVideoWatched, updateVideoUrl } from "@/lib/actions";

interface Video {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string | null;
  url: string | null;
  watched: boolean;
  pattern: { id: string; name: string };
}

function youtubeSearchUrl(title: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    "Padho with Pratyush " + title
  )}`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [filterWatched, setFilterWatched] = useState<"all" | "watched" | "unwatched">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getVideos();
    setVideos(data as unknown as Video[]);
  }

  const filteredVideos = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchWatched =
      filterWatched === "all" ||
      (filterWatched === "watched" && v.watched) ||
      (filterWatched === "unwatched" && !v.watched);
    return matchSearch && matchWatched;
  });

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await toggleVideoWatched(id);
      await loadData();
    });
  };

  const handleSaveUrl = (id: string) => {
    startTransition(async () => {
      await updateVideoUrl(id, editValue);
      setEditingId(null);
      setEditValue("");
      await loadData();
    });
  };

  const watched = videos.filter((v) => v.watched).length;
  const total = videos.length;
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

  // Group by pattern
  const grouped = filteredVideos.reduce<Record<string, Video[]>>((acc, v) => {
    const key = v.pattern.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playlist</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          DSA Patterns 2025 · Padho with Pratyush
        </p>
      </div>

      {/* Progress */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.03)), var(--color-bg-card)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
        }}
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              Playlist progress
            </p>
            <p className="text-3xl font-bold font-mono">
              <span className="text-[var(--color-accent-purple)]">{watched}</span>
              <span className="text-[var(--color-text-muted)] text-lg"> / {total}</span>
            </p>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--color-accent-purple)]">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-bg-primary)]/60 overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--color-accent-purple), #c084fc)",
              boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)",
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
          />
        </div>
        <div className="flex rounded-lg border border-[rgba(255,255,255,0.07)] overflow-hidden self-start sm:self-auto">
          {(["all", "unwatched", "watched"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterWatched(f)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filterWatched === f
                  ? "bg-[var(--color-accent-blue-dim)] text-[var(--color-accent-blue)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([patternName, vids]) => (
          <div key={patternName}>
            <div className="flex items-center gap-2 mb-3">
              <PlayCircle className="w-4 h-4 text-[var(--color-accent-purple)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                {patternName}
              </h3>
              <span className="text-xs text-[var(--color-text-muted)] font-mono">
                {vids.filter((v) => v.watched).length}/{vids.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {vids.map((video) => {
                const watchUrl = video.url ?? youtubeSearchUrl(video.title);
                const isEditing = editingId === video.id;
                return (
                  <div
                    key={video.id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg transition-all ${
                      video.watched
                        ? "bg-[var(--color-accent-emerald-dim)]/20 border border-emerald-800/40"
                        : "glass-row hover:!border-[var(--color-accent-purple)]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggle(video.id)}
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
                      <span className="text-xs font-mono text-[var(--color-text-muted)] w-10 shrink-0">
                        #{video.episodeNumber}
                      </span>
                      <span
                        className={`text-sm flex-1 truncate ${
                          video.watched
                            ? "text-[var(--color-text-muted)] line-through"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {video.title}
                      </span>
                      {video.duration && (
                        <span className="text-xs font-mono text-[var(--color-text-muted)] shrink-0">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full sm:w-auto">
                          <input
                            type="url"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="px-2 py-1 text-xs bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded text-[var(--color-text-primary)] w-48 sm:w-52 focus:outline-none focus:border-[var(--color-accent-blue)]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveUrl(video.id);
                              if (e.key === "Escape") {
                                setEditingId(null);
                                setEditValue("");
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSaveUrl(video.id)}
                            className="px-2 py-1 text-xs font-medium rounded bg-[var(--color-accent-blue)] text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditValue("");
                            }}
                            className="px-2 py-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <a
                            href={watchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--color-accent-purple-dim)]/40 text-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-dim)]/70 transition-colors"
                            title={video.url ? "Open in YouTube" : "Search YouTube (no URL set)"}
                          >
                            {video.url ? <ExternalLink className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                            {video.url ? "Watch" : "Find"}
                          </a>
                          <button
                            onClick={() => {
                              setEditingId(video.id);
                              setEditValue(video.url ?? "");
                            }}
                            className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
                            title={video.url ? "Edit URL" : "Set URL"}
                          >
                            {video.url ? (
                              <Pencil className="w-3.5 h-3.5" />
                            ) : (
                              <Link2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {filteredVideos.length === 0 && (
          <div className="section-card p-10 text-center text-sm text-[var(--color-text-muted)]">
            No videos match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
