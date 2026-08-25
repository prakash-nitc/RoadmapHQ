// Maps each of your patterns to where the fresh problems live on Propeers
// (topic > sub-topics), read from the platform's structure. Bit Manipulation
// has no Propeers track. Keyed by the pattern name as stored in the DB.

export const PROPEERS_MAP: Record<string, { topic: string; sub: string }> = {
  "Two Pointers": { topic: "Arrays", sub: "Two Pointers · (also Strings › Two Pointers)" },
  "Fast & Slow Pointers": { topic: "Linked List", sub: "Fast and Slow Pointers" },
  "Sliding Window": { topic: "Arrays", sub: "Sliding Window · (also Strings › Sliding Window)" },
  "Kadane's Algorithm": { topic: "Dynamic Programming", sub: "Basic DP (Kadane = 1D DP) · (also Arrays › Prefix Sums)" },
  "Prefix Sum": { topic: "Arrays", sub: "Prefix Sums" },
  "Merge Intervals": { topic: "Arrays", sub: "Merge Intervals" },
  "In-place Reversal of LinkedList": { topic: "Linked List", sub: "In-Place Reversal Technique" },
  "Stack": { topic: "Stacks & Queues", sub: "Monotonic Stack · Expression Evaluation · Design Problems" },
  "Hash Maps": { topic: "Strings", sub: "Hashmaps" },
  "Binary Search": { topic: "Binary Search", sub: "Basic · Range Search · Allocation · Counting Occurrences · Bitonic" },
  "Heap": { topic: "Priority Queues", sub: "Kth Largest/Smallest · Top K Frequent · Merge K Lists · Design" },
  "Recursion & Backtracking": { topic: "Recursion", sub: "Backtracking · Basic Recursive · Divide & Conquer · Recursive Search" },
  "Trees": { topic: "Binary Trees & BST", sub: "Traversal · Validation & Properties · Path Sum · Construction" },
  "Graphs": { topic: "Graphs", sub: "Connected Components · Shortest Path · Cycle Detection · MST · DAG · Coloring" },
  "Dynamic Programming": { topic: "Dynamic Programming", sub: "Basic · Optimal Substructure · Knapsack · Counting · Interval/Range DP" },
  // Bit Manipulation: no Propeers track — use your sheet / LeetCode Bit tag.
};
