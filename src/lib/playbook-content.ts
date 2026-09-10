// The Revision Playbook — distilled from docs/DSA_Revision_Strategy.docx so the
// protocol lives where the revising happens. Quotes and tables are kept faithful
// to the doc; the "your call" annotations record decisions made since (Propeers
// as the fresh-problem engine, pattern-first practice).

// ── §11 The 60-second pattern-trigger drill: the trigger table ──
export interface Trigger {
  signal: string;
  pattern: string;
}

export const TRIGGERS: Trigger[] = [
  { signal: "Longest / shortest contiguous subarray or substring with a constraint", pattern: "Sliding Window" },
  { signal: "Count of subarrays with a sum property", pattern: "Prefix Sum + HashMap" },
  { signal: "Kth largest / smallest, top K, merge K sorted", pattern: "Heap" },
  { signal: "Minimise the maximum, or maximise the minimum", pattern: "Binary Search on answer" },
  { signal: "The answer is monotonic in some parameter", pattern: "Binary Search on answer" },
  { signal: "Next or previous greater / smaller element", pattern: "Monotonic Stack" },
  { signal: "All permutations, combinations, subsets, partitions", pattern: "Backtracking" },
  { signal: "Number of ways, or optimal value with overlapping choices", pattern: "Dynamic Programming" },
  { signal: "Connected components, reachability, shortest path in a grid", pattern: "Graph BFS/DFS or Union-Find" },
  { signal: "Cycle in a linked list, or in an implicit i → a[i] mapping", pattern: "Fast & Slow Pointers" },
  { signal: "Sorted array plus a pair, triplet, or in-place partition", pattern: "Two Pointers" },
  { signal: "Overlapping ranges, scheduling, room allocation", pattern: "Merge Intervals (often + Heap)" },
  { signal: "Prefix matching, autocomplete, dictionary of words", pattern: "Trie" },
];

// ── §3 The three revision modes ──
export interface Mode {
  n: number;
  name: string;
  time: string;
  setup: string;
  steps: string[];
  note?: string;
  accent: string;
}

export const MODES: Mode[] = [
  {
    n: 1,
    name: "Recall",
    time: "60–90 sec",
    setup: "Notes closed · no IDE",
    accent: "#22d3ee",
    steps: [
      "Read the problem title only. Do not open the note, do not read the statement.",
      "Out loud — spoken, not thought — state: the pattern, the key insight, the time and space complexity, and the one gotcha that bit you.",
      "Then open the note and check.",
      "Match → mark Revised. Mismatch or blank → it goes on today's repair list.",
    ],
    note: "Say it out loud. Thinking it lets you skip the hard part and declare victory. Speaking forces you to produce the sentence — which is what an interviewer asks for.",
  },
  {
    n: 2,
    name: "Skeleton",
    time: "5 min",
    setup: "Paper or blank page · no IDE",
    accent: "#a855f7",
    steps: [
      "Write the function signature, the core loop or recursion structure, and the 3–4 lines that carry the actual logic.",
      "Skip boilerplate, imports, edge-case guards.",
      "For Next Greater Element that is four lines: stack declaration, while-pop condition, assignment, push.",
      "Then compare against your old code.",
    ],
    note: "The middle gear most people don't know exists. Catches ~80% of what a full re-solve catches, at a quarter of the cost. Use it when the queue is long or the day is short.",
  },
  {
    n: 3,
    name: "Cold re-solve",
    time: "20 min",
    setup: "IDE open · notes closed",
    accent: "#4f8cff",
    steps: [
      "Open the problem. Write it from scratch. Submit. It must actually pass.",
      "No notes, no editorial, no peeking at your old submission.",
      "Passed → open your old solution and diff it. A different approach is interesting; note which is better and why.",
      "Stuck at 20 minutes → stop. Do not grind past the timebox. Run the escape procedure.",
    ],
  },
];

// ── §3 Which mode for which situation ──
export const MODE_MATRIX: { situation: string; mode: string }[] = [
  { situation: "SUPPORT problem, scheduled review", mode: "Recall only. Never re-code these." },
  { situation: "CORE problem, weekly touch", mode: "Recall" },
  { situation: "CORE problem, monthly touch", mode: "Full cold re-solve" },
  { situation: "Failed a recall", mode: "Diagnose first (Case A or B), then repair at the right level" },
  { situation: "Failed a cold re-solve once", mode: "Reschedule 3 days out, re-solve again" },
  { situation: "Failed the SAME problem twice", mode: "Stop re-solving. The concept is broken, not the memory — return to learning mode." },
  { situation: "Short on time, long queue", mode: "Skeleton across more problems beats full re-solve on fewer" },
];

// ── §2 The mastery ladder ──
export const LADDER: { level: string; meaning: string; next: string; color: string }[] = [
  { level: "Not started", meaning: "Never touched", next: "—", color: "#6b6b7a" },
  { level: "Attempted", meaning: "Tried and failed, OR solved only after opening your notes", next: "Re-solve from scratch in 3 days. Needing the answer key means it is not restored.", color: "#fb923c" },
  { level: "Solved", meaning: "Correct solution written at some point; decays within ~3 weeks", next: "Needs a recall pass to find out if it survived.", color: "#fbbf24" },
  { level: "Revised", meaning: "Passed a 60-second recall with notes closed: pattern, key insight, complexity", next: "Recall again in ~2 weeks. Escalate CORE problems to a cold re-solve.", color: "#38bdf8" },
  { level: "Mastered", meaning: "Cold re-solved with zero help, AND solved once inside a mixed untagged timed set", next: "The finish line. Monthly touch only.", color: "#34d399" },
];

// ── §6 The spaced repetition schedule ──
export const SCHEDULE: { when: string; action: string; detail: string }[] = [
  { when: "Day 0", action: "Solve or repair it", detail: "Write the 3-line note immediately: pattern, key insight, and “I would have missed this because…”" },
  { when: "Day 1", action: "Recall (Mode 1)", detail: "60 seconds, title only. Failure sends it to diagnosis." },
  { when: "Day 4", action: "Recall (Mode 1)", detail: "Same test." },
  { when: "Day 10", action: "Cold re-solve (Mode 3)", detail: "Full code, 20-minute timebox, no notes." },
  { when: "Day 25", action: "Cold re-solve (Mode 3)", detail: "Passing twice at this level moves it to the monthly pool." },
  { when: "Monthly", action: "Mixed set", detail: "Appears in a random untagged timed set. Passing here earns Mastered." },
];

// ── §1 The yield arithmetic ──
export const YIELD: { activity: string; cost: string; yield: string; rating: string; color: string }[] = [
  { activity: "Solve a new medium problem", cost: "40–45 min", yield: "+1 problem, decays in ~3 weeks", rating: "Low", color: "#f87171" },
  { activity: "Cold re-solve a decayed problem", cost: "8–20 min", yield: "Restores a problem you already understood", rating: "High — roughly 4×", color: "#fbbf24" },
  { activity: "Repair a whole pattern at once", cost: "~90 min", yield: "Restores 8–20 problems simultaneously", rating: "Highest available", color: "#34d399" },
  { activity: "60-second recall", cost: "1 min", yield: "Diagnoses which problems have decayed", rating: "Highest as triage", color: "#22d3ee" },
];

// ── §13 When to bring in other sheets ──
export const SHEETS: { source: string; when: string; why: string; note?: string }[] = [
  {
    source: "Propeers (your subscription)",
    when: "Every revision session — your fresh-problem engine",
    why: "Pattern-organised with sub-topic videos, so it matches how you revise. Draw 2–3 unseen problems per pattern, then stop. Use the coding problems, not the MCQ tests — MCQs test recognition, not the muscle memory of writing the solution.",
    note: "Your current call",
  },
  {
    source: "Striver's DP series",
    when: "Only if Propeers' DP track proves thin",
    why: "The doc flagged your sheet's 3 DP problems as a genuine gap. Propeers has 6 DP sub-topics (Basic, Optimal Substructure, Knapsack, Counting, Interval/Range, Probability), which likely closes it. Re-check when you reach DP.",
    note: "Superseded",
  },
  { source: "Targeted additions to existing patterns", when: "During the repair session for that pattern", why: "Named omissions: Largest Rectangle in Histogram, Trapping Rain Water, Find Median from Data Stream, N-Queens, Word Search, Subsets II, Combination Sum II. ~7 problems, all standard, all commonly asked." },
  { source: "LeetCode company tags", when: "4 weeks before a specific drive", why: "Flipkart, Oracle, VISA, SAP. 30–40 tagged problems in that window. The correct and only time for company-specific work." },
  { source: "Top Interview 150 / Blind 75", when: "Only after Trees, Graphs and DP are cold-re-solvable", why: "Use purely as a coverage audit — scan the list, solve only what you've genuinely never seen. Do not work through it linearly; overlap with your sheet is large." },
  { source: "Codeforces", when: "October onward, weekly", why: "For contest pressure only, not topic coverage. Div 3 or Div 4." },
];

// ── §12 The mistake log entry shape ──
export const MISTAKE_FIELDS: { field: string; example: string }[] = [
  { field: "Problem", example: "Subarray Sums Divisible by K" },
  { field: "What went wrong", example: "Negative remainders — wrong count on inputs containing negative numbers" },
  { field: "Why I missed it", example: "Assumed Java's % behaves like mathematical mod. It returns a negative for negative operands." },
  { field: "The fix, as a rule", example: "In any prefix-mod problem, always write ((sum % k) + k) % k" },
  { field: "Category", example: "Language gotcha (not a pattern gap)" },
];
