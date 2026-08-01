"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Layers, PlayCircle, Code2, Settings2 } from "lucide-react";
import { addPattern, addVideo, addProblem, getPatterns } from "@/lib/actions";
import { ManageProblems } from "@/components/admin/ManageProblems";

interface PatternOption {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [patterns, setPatterns] = useState<PatternOption[]>([]);
  const [activeForm, setActiveForm] = useState<"pattern" | "video" | "problem" | "manage">("pattern");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Form states
  const [patternName, setPatternName] = useState("");
  const [patternDesc, setPatternDesc] = useState("");

  const [videoEp, setVideoEp] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoPattern, setVideoPattern] = useState("");
  const [videoDuration, setVideoDuration] = useState("");

  const [problemTitle, setProblemTitle] = useState("");
  const [problemPattern, setProblemPattern] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState("");
  const [problemPlatform, setProblemPlatform] = useState("LEETCODE");
  const [problemUrl, setProblemUrl] = useState("");
  const [problemSubPattern, setProblemSubPattern] = useState("");

  useEffect(() => {
    loadPatterns();
  }, []);

  async function loadPatterns() {
    const pats = await getPatterns();
    setPatterns(pats.map((p) => ({ id: p.id, name: p.name })));
  }

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddPattern = () => {
    if (!patternName.trim()) return;
    startTransition(async () => {
      await addPattern({ name: patternName, description: patternDesc || undefined });
      setPatternName("");
      setPatternDesc("");
      await loadPatterns();
      showSuccess("Pattern added!");
    });
  };

  const handleAddVideo = () => {
    if (!videoTitle.trim() || !videoPattern || !videoEp) return;
    startTransition(async () => {
      await addVideo({
        episodeNumber: parseInt(videoEp),
        title: videoTitle,
        patternId: videoPattern,
        duration: videoDuration || undefined,
      });
      setVideoEp("");
      setVideoTitle("");
      setVideoDuration("");
      showSuccess("Video added!");
      router.refresh();
    });
  };

  const handleAddProblem = () => {
    if (!problemTitle.trim() || !problemPattern || !problemUrl) return;
    startTransition(async () => {
      await addProblem({
        title: problemTitle,
        patternId: problemPattern,
        difficulty: problemDifficulty || undefined,
        platform: problemPlatform,
        url: problemUrl,
        subPattern: problemSubPattern || undefined,
      });
      setProblemTitle("");
      setProblemUrl("");
      setProblemSubPattern("");
      showSuccess("Problem added!");
      router.refresh();
    });
  };

  const forms = [
    { key: "pattern" as const, label: "Add Pattern", icon: Layers },
    { key: "video" as const, label: "Add Video", icon: PlayCircle },
    { key: "problem" as const, label: "Add Problem", icon: Code2 },
    { key: "manage" as const, label: "Manage Problems", icon: Settings2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="eyebrow flex items-center gap-1.5 mb-1">
          <Settings2 className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
          Manage content
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
          Add new patterns, videos, and problems to your roadmap
        </p>
      </div>

      {/* Form Selector — pill group */}
      <div className="glass-input inline-flex items-center gap-1 p-1 rounded-full">
        {forms.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setActiveForm(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeForm === f.key
                  ? "bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white shadow-lg shadow-blue-500/20"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 rounded-lg bg-[var(--color-accent-emerald-dim)]/40 border border-emerald-800/50 text-sm text-[var(--color-accent-emerald)]">
          ✓ {success}
        </div>
      )}

      {/* Forms */}
      <div className="section-card p-7 space-y-4">
        {activeForm === "pattern" && (
          <>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">New Pattern</h2>
            <input
              type="text"
              placeholder="Pattern name (e.g. Trie, Bit Manipulation)"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <textarea
              placeholder="Description (optional)"
              value={patternDesc}
              onChange={(e) => setPatternDesc(e.target.value)}
              rows={3}
              className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-y"
            />
            <button onClick={handleAddPattern} disabled={isPending || !patternName.trim()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Add Pattern
            </button>
          </>
        )}

        {activeForm === "video" && (
          <>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">New Video</h2>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Episode #" value={videoEp} onChange={(e) => setVideoEp(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
              <input type="text" placeholder="Duration (e.g. 32:15)" value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            </div>
            <input type="text" placeholder="Video title" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            <select value={videoPattern} onChange={(e) => setVideoPattern(e.target.value)} className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]">
              <option value="">Select Pattern</option>
              {patterns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleAddVideo} disabled={isPending || !videoTitle || !videoPattern || !videoEp} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Add Video
            </button>
          </>
        )}

        {activeForm === "problem" && (
          <>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">New Problem</h2>
            <input type="text" placeholder="Problem title" value={problemTitle} onChange={(e) => setProblemTitle(e.target.value)} className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            <input type="url" placeholder="Problem URL (LeetCode/GFG link)" value={problemUrl} onChange={(e) => setProblemUrl(e.target.value)} className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            <div className="grid grid-cols-3 gap-3">
              <select value={problemPattern} onChange={(e) => setProblemPattern(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]">
                <option value="">Pattern</option>
                {patterns.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={problemDifficulty} onChange={(e) => setProblemDifficulty(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]">
                <option value="">Difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <select value={problemPlatform} onChange={(e) => setProblemPlatform(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)]">
                <option value="LEETCODE">LeetCode</option>
                <option value="GFG">GFG</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <input type="text" placeholder="Sub-pattern (optional, e.g. Traversal)" value={problemSubPattern} onChange={(e) => setProblemSubPattern(e.target.value)} className="w-full glass-input px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]" />
            <button onClick={handleAddProblem} disabled={isPending || !problemTitle || !problemPattern || !problemUrl} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Add Problem
            </button>
          </>
        )}

        {activeForm === "manage" && (
          <>
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Edit &amp; delete problems
            </h2>
            <ManageProblems patterns={patterns} />
          </>
        )}
      </div>
    </div>
  );
}
