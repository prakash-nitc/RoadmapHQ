// Seed data: 15 DSA patterns extracted from the roadmap sheet
// Order matches the recommended study sequence from the playlist

export const patterns = [
  {
    name: "Two Pointers",
    description: "Technique using two pointers to iterate through sorted arrays or linked lists. Reduces O(n²) to O(n) for pair/triplet problems.",
    order: 1,
  },
  {
    name: "Fast & Slow Pointers",
    description: "Floyd's cycle detection and related linked list techniques using two pointers moving at different speeds.",
    order: 2,
  },
  {
    name: "Sliding Window",
    description: "Maintain a window over contiguous elements. Converts O(n²) substring/subarray problems to O(n) by sliding and adjusting.",
    order: 3,
  },
  {
    name: "Kadane's Algorithm",
    description: "Maximum subarray sum pattern and its variations. Core dynamic programming on subarrays.",
    order: 4,
  },
  {
    name: "Prefix Sum",
    description: "Precompute cumulative sums for O(1) range queries. Foundation for subarray sum problems.",
    order: 5,
  },
  {
    name: "Merge Intervals",
    description: "Sort intervals by start time and merge overlapping ones. Used in scheduling, calendar, and range problems.",
    order: 6,
  },
  {
    name: "In-place Reversal of LinkedList",
    description: "Reverse linked lists in-place without extra space. Foundation for many linked list manipulation problems.",
    order: 7,
  },
  {
    name: "Stack",
    description: "LIFO data structure for parentheses matching, next greater element, monotonic stack patterns.",
    order: 8,
  },
  {
    name: "Hash Maps",
    description: "O(1) lookup for frequency counting, duplicate detection, and grouping problems.",
    order: 9,
  },
  {
    name: "Binary Search",
    description: "Divide and conquer on sorted data. Includes search space binary search for optimization problems.",
    order: 10,
  },
  {
    name: "Heap",
    description: "Priority queue for Top-K, Kth element, merge sorted collections, and greedy scheduling problems.",
    order: 11,
  },
  {
    name: "Recursion & Backtracking",
    description: "Explore all possibilities systematically. Build solutions incrementally, backtrack on invalid paths.",
    order: 12,
  },
  {
    name: "Trees",
    description: "Binary tree/BST traversals, validation, construction, path problems, and LCA queries.",
    order: 13,
  },
  {
    name: "Graphs",
    description: "BFS, DFS, cycle detection, topological sort, shortest paths (Dijkstra, Bellman-Ford), MST.",
    order: 14,
  },
  {
    name: "Dynamic Programming",
    description: "Optimize overlapping subproblems with memoization or tabulation. Fibonacci, knapsack, and beyond.",
    order: 15,
  },
];
