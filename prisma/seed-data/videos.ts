// Seed data: All 114 videos from the YouTube playlist
// Extracted from "youtube playlist.pdf" screenshots
// Channel: Padho with Pratyush — DSA Patterns 2025

export interface SeedVideo {
  episodeNumber: number;
  title: string;
  patternName: string;
  duration?: string;
  url?: string;
}

export const videos: SeedVideo[] = [
  // ─── Introduction & Roadmap ────────────────────────────────
  { episodeNumber: 1, title: "The Best Way To Learn DSA in 2025 | DSA Patterns by IITian", patternName: "Two Pointers", duration: "19:17" },
  { episodeNumber: 2, title: "Episode 2 – DSA Patterns Roadmap 2025 (Beginner to Advanced)", patternName: "Two Pointers", duration: "8:36" },

  // ─── Two Pointers (Ep 3–9) ─────────────────────────────────
  { episodeNumber: 3, title: "Episode 3 – Master DSA Patterns with 2 Pointers Technique", patternName: "Two Pointers", duration: "47:21" },
  { episodeNumber: 4, title: "Episode 4 | Master DSA Patterns with the 2 Pointer Technique", patternName: "Two Pointers", duration: "30:11" },
  { episodeNumber: 5, title: "Episode 5 - 2 Pointer DSA Pattern | DSA PATTERNS ROADMAP 2025", patternName: "Two Pointers", duration: "50:42" },
  { episodeNumber: 6, title: "DSA Patterns Episode 6 - What If You Could Master Time Complexity in Just 30 Minutes?", patternName: "Two Pointers", duration: "34:07" },
  { episodeNumber: 7, title: "DSA Patterns Episode 7: Two Pointers Pattern: More Interview Questions", patternName: "Two Pointers", duration: "43:02" },
  { episodeNumber: 8, title: "DSA PATTERNS Episode 8 | Two Pointers Pattern: Most Important Questions", patternName: "Two Pointers", duration: "41:16" },
  { episodeNumber: 9, title: "DSA PAtterns Episode 9 | Two Pointers Pattern: Complete Revision in One Video", patternName: "Two Pointers", duration: "9:34" },

  // ─── Sliding Window (Ep 10–16) ─────────────────────────────
  { episodeNumber: 10, title: "DSA PATTERNS Episode 10 | Introduction to Sliding Window", patternName: "Sliding Window", duration: "11:34" },
  { episodeNumber: 11, title: "DSA PATTERNS Episode 11 Sliding Window Pattern: Easy & Medium Questions", patternName: "Sliding Window", duration: "1:09:42" },
  { episodeNumber: 12, title: "DSA PATTERNS Episode 12 Sliding Window Pattern: Core Interview Questions", patternName: "Sliding Window", duration: "1:02:05" },
  { episodeNumber: 13, title: "DSA PATTERNS Episode 13 Sliding Window Pattern: Important Questions", patternName: "Sliding Window", duration: "32:27" },
  { episodeNumber: 14, title: "DSA PATTERNS Episode 14 Sliding Window Pattern Revision (Part 1)", patternName: "Sliding Window", duration: "25:32" },
  { episodeNumber: 15, title: "DSA PATTERNS Episode 15 | Sliding Window Pattern Revision (Part 2)", patternName: "Sliding Window", duration: "24:11" },
  { episodeNumber: 16, title: "DSA PATTERNS Episode 16 | Sliding Window Pattern: Amazon Interview Question", patternName: "Sliding Window", duration: "19:53" },

  // ─── Fast & Slow Pointers / Linked List (Ep 17–21, 25) ────
  { episodeNumber: 17, title: "DSA PATTERNS Episode 17 | Linked List Slow & Fast Pointer Technique: Introduction", patternName: "Fast & Slow Pointers", duration: "33:18" },
  { episodeNumber: 18, title: "My 4 Year DSA Learning JOURNEY | Mistakes | Striver Love Babbar Pepcoding Apna College", patternName: "Fast & Slow Pointers", duration: "14:21" },
  { episodeNumber: 19, title: "DSA PATTERNS Episode 18 | Linked List Slow-Fast Pointer: Important Questions", patternName: "Fast & Slow Pointers", duration: "24:19" },
  { episodeNumber: 20, title: "DSA PATTERNS Episode 19 | Linked List Basics for Beginners", patternName: "Fast & Slow Pointers", duration: "33:53" },
  { episodeNumber: 21, title: "DSA PATTERNS Episode 20 | Linked List Slow-Fast Pointer: Important Questions", patternName: "Fast & Slow Pointers", duration: "29:34" },
  { episodeNumber: 22, title: "DSA PATTERNS Episode 21 | Linked List Slow-Fast Pointer Complete Revision", patternName: "Fast & Slow Pointers", duration: "10:23" },

  // ─── Kadane's Algorithm (Ep 22–24) ─────────────────────────
  { episodeNumber: 23, title: "DSA PATTERNS Episode 22 | Kadane's Algorithm Pattern: Introduction & Intuition", patternName: "Kadane's Algorithm", duration: "36:20" },
  { episodeNumber: 24, title: "The DSA Revolution Has Started – And People Are Not Happy", patternName: "Kadane's Algorithm", duration: "12:50" },
  { episodeNumber: 25, title: "DSA PATTERNS Episode 23 | Kadane's Algorithm: Most Important Interview Question", patternName: "Kadane's Algorithm", duration: "27:57" },
  { episodeNumber: 26, title: "DSA PATTERNS Episode 24 | Kadane's Algorithm Pattern: Quick Revision", patternName: "Kadane's Algorithm", duration: "38:14" },

  // ─── Linked List Cycle Logic (Ep 25) ───────────────────────
  { episodeNumber: 27, title: "DSA PATTERNS Episode 25 | Linked List Start of Cycle Logic Explained", patternName: "Fast & Slow Pointers", duration: "17:04" },

  // ─── Prefix Sum (Ep 26–33) ─────────────────────────────────
  { episodeNumber: 28, title: "DSA Patterns Course 2025 | Big Announcement | Best Way To Learn DSA in 2025", patternName: "Prefix Sum", duration: "13:30" },
  { episodeNumber: 29, title: "DSA PATTERNS Episode 26 | Prefix Sum Pattern Introduction | DSA ROADMAP 2025", patternName: "Prefix Sum", duration: "38:50" },
  { episodeNumber: 30, title: "DSA Patterns Episode 27 | Master DSA Patterns With Prefix Sum | Leetcode Patterns", patternName: "Prefix Sum", duration: "22:37" },
  { episodeNumber: 31, title: "DSA Patterns Lecture 28 | Master DSA Patterns With Prefix Sum | Interview Questions FAANG", patternName: "Prefix Sum", duration: "32:47" },
  { episodeNumber: 32, title: "Lecture 29 | The ABSOLUTE BEST Prefix Sum Pattern Hacks for Amazon Interviews", patternName: "Prefix Sum", duration: "28:26" },
  { episodeNumber: 33, title: "DSA Patterns Lecture 30 | Master Prefix Sum Pattern in 10 Minutes", patternName: "Prefix Sum", duration: "12:36" },

  // ─── Merge Intervals (Ep 31–35) ───────────────────────────
  { episodeNumber: 34, title: "DSA Patterns L31 | Master Merge Interval DSA Patterns | MERGE INTERVALS LEETCODE", patternName: "Merge Intervals", duration: "48:09" },
  { episodeNumber: 35, title: "L32 | Master DSA Pattern Merge Interval | Leetcode Merge Intervals", patternName: "Merge Intervals", duration: "22:07" },
  { episodeNumber: 36, title: "DSA Patterns L33 | Merge Intervals | Master DSA Patterns in 2025", patternName: "Merge Intervals", duration: "36:27" },
  { episodeNumber: 37, title: "L34 DSA Patterns 2025 | Merge Overlapping Intervals | Merge Interval DSA Pattern", patternName: "Merge Intervals", duration: "3:56" },
  { episodeNumber: 38, title: "35. DSA PATTERNS 2025 | Master Merge Interval With Interview Questions | FAANG", patternName: "Merge Intervals", duration: "33:01" },

  // ─── Stack (Ep 36–41) ─────────────────────────────────────
  { episodeNumber: 39, title: "Master STACK in DSA Patterns 2025 | Introduction to Stack | CPP JAVA PYTHON", patternName: "Stack", duration: "23:42" },
  { episodeNumber: 40, title: "Learn DSA Like Never Before | Master Stack DSA Pattern With This Simple Trick", patternName: "Stack", duration: "27:10" },
  { episodeNumber: 41, title: "Most Important STACK Question For FAANG Interviews | Master DSA Patterns", patternName: "Stack", duration: "32:56" },
  { episodeNumber: 42, title: "Next Greater Element | Stack and Queue DSA Pattern 2025", patternName: "Stack", duration: "34:38" },
  { episodeNumber: 43, title: "Master Stack DSA Pattern With 3 Questions | DSA Patterns Course", patternName: "Stack", duration: "57:27" },
  { episodeNumber: 44, title: "Revise Stack Data Structure in 10 Minutes | DSA Patterns Course", patternName: "Stack", duration: "13:46" },

  // ─── Hash Maps (Ep 42–43) ─────────────────────────────────
  { episodeNumber: 45, title: "The Only Video You Need TO Master HASHMAPS | DSA Patterns Course Cpp JAVA Python", patternName: "Hash Maps", duration: "31:18" },
  { episodeNumber: 46, title: "4 Questions to Master HASHMAPS in C++ JAVA Python | DSA Patterns Course 2026", patternName: "Hash Maps", duration: "1:26:02" },

  // ─── Linked List Reversal (Ep 44–47) ──────────────────────
  { episodeNumber: 47, title: "Linked List Reversal In the Easiest Way Possible | DSA Patterns Course 2026 CPP JAVA Python", patternName: "In-place Reversal of LinkedList", duration: "52:23" },
  { episodeNumber: 48, title: "Best Explanation Of Kadane One Deletion On The Internet | DSA Pattern Course CPP JAVA", patternName: "Kadane's Algorithm", duration: "44:37" },
  { episodeNumber: 49, title: "Best Explanation on Reverse LinkList Nodes in K Group | DSA Patterns CPP JAVA Python", patternName: "In-place Reversal of LinkedList", duration: "52:24" },
  { episodeNumber: 50, title: "Rotate A Linked List | Master DSA in 2026 With DSA Patterns", patternName: "In-place Reversal of LinkedList", duration: "39:34" },

  // ─── Binary Search (Ep 48–57) ─────────────────────────────
  { episodeNumber: 51, title: "Believe Me, You DON'T Know The Binary Search Algorithm | DSA Patterns Course 2026", patternName: "Binary Search", duration: "38:53" },
  { episodeNumber: 52, title: "This is The Best Intro To Binary Search | DSA Patterns 2026", patternName: "Binary Search", duration: "50:15" },
  { episodeNumber: 53, title: "Most Important Question in BINARY Search Algorithm | Find Mountain peak Leetcode", patternName: "Binary Search", duration: "21:58" },
  { episodeNumber: 54, title: "I Will make Binary Search Easy For You | DSA Patterns Course | C++ Java Python", patternName: "Binary Search", duration: "26:45" },
  { episodeNumber: 55, title: "Don't Miss This Binary Search Interview Question | DSA Patterns 2026 Cpp Java Python", patternName: "Binary Search", duration: "42:15" },
  { episodeNumber: 56, title: "One Video To Solve All Binary Search Interview Questions | DSA Patterns 2026", patternName: "Binary Search", duration: "37:40" },
  { episodeNumber: 57, title: "Best Explanation of Aggressive Cows Leetcode | Binary Search DSA Pattern", patternName: "Binary Search", duration: "36:52" },
  { episodeNumber: 58, title: "Do Not Miss This Amazon Interview Question | Binary Search DSA Patterns Cpp Java Python", patternName: "Binary Search", duration: "32:10" },
  { episodeNumber: 59, title: "Binary Search on 2D Array | Best Video On Binary Search DSA Patterns CPP Java Python", patternName: "Binary Search", duration: "34:56" },
  { episodeNumber: 60, title: "I Failed a 40 LPA Interview Because Of This Binary Search Question | Do not Miss This", patternName: "Binary Search", duration: "1:10:49" },

  // ─── Heap (Ep 58–66) ──────────────────────────────────────
  { episodeNumber: 61, title: "Introduction To Heap DSA Pattern | One Of The Most Important Patterns For Coding Interviews", patternName: "Heap", duration: "34:08" },
  { episodeNumber: 62, title: "The Best Video To Learn HEAP Data Structure | DSA Patterns 2026 CPP JAVA Python", patternName: "Heap", duration: "28:33" },
  { episodeNumber: 63, title: "HEAP On Pairs Explained in One Shot | CPP JAVA PYTHON | DSA Patterns", patternName: "Heap", duration: "51:31" },
  { episodeNumber: 64, title: "Solve Any HEAP Question By This Template | Top K frequent Elements Leetcode", patternName: "Heap", duration: "41:07" },
  { episodeNumber: 65, title: "5 Step Template To Solve any HEAP Problem | DSA PATTERNS 2026", patternName: "Heap", duration: "28:43" },
  { episodeNumber: 66, title: "You Will Never Forget The HEAP Greedy DSA Pattern After This Video", patternName: "Heap", duration: "33:52" },
  { episodeNumber: 67, title: "Google Interview Question On Heap Dsa Pattern Made Simple | IPO Leetcode", patternName: "Heap", duration: "29:38" },
  { episodeNumber: 68, title: "Best Explanation Of Merge K Sorted Lists | HEAP DSA Pattern", patternName: "Heap", duration: "24:32" },
  { episodeNumber: 69, title: "Let's Revise HEAP Data Structure With This Leetcode Hard Question | CPU Task Scheduler", patternName: "Heap", duration: "42:19" },

  // ─── Recursion & Backtracking (Ep 67–75) ──────────────────
  { episodeNumber: 70, title: "Intro To Recursion DSA Pattern | Beginner To Advanced | Best Recursion Series", patternName: "Recursion & Backtracking", duration: "25:33" },
  { episodeNumber: 71, title: "Recursion Fixed Template For All Questions | One Template To Solve Recursion Problems", patternName: "Recursion & Backtracking", duration: "16:56" },
  { episodeNumber: 72, title: "Recursion & Backtracking Explained Once and For All | DSA for Beginners", patternName: "Recursion & Backtracking", duration: "26:24" },
  { episodeNumber: 73, title: "Learn Recursion Like A Pro", patternName: "Recursion & Backtracking", duration: "36:02" },
  { episodeNumber: 74, title: "What If You Could Master Recursion in 3 Easy Questions", patternName: "Recursion & Backtracking", duration: "30:18" },
  { episodeNumber: 75, title: "Start Learning Recursion Backtracking With This Question | Best Recursion Explanation", patternName: "Recursion & Backtracking", duration: "32:57" },
  { episodeNumber: 76, title: "5 Point Template To Crack any Recursion Leetcode Question | DSA Patterns 2026", patternName: "Recursion & Backtracking", duration: "47:27" },
  { episodeNumber: 77, title: "Stop Struggling with Recursion: Combination Sum Explained Simply", patternName: "Recursion & Backtracking", duration: "26:05" },
  { episodeNumber: 78, title: "Next Phase Plan For The DSA Pattern Series | Comment Your Thoughts", patternName: "Recursion & Backtracking", duration: "10:27" },

  // ─── Trees (Ep 76–88) ─────────────────────────────────────
  { episodeNumber: 79, title: "Starting TREE Series!", patternName: "Trees", duration: "20:36" },
  { episodeNumber: 80, title: "Tree Traversals Made Simple! Preorder Inorder Postorder", patternName: "Trees", duration: "26:25" },
  { episodeNumber: 81, title: "EP 03: Level Order Traversal In Binary Tree | Intuition and Template", patternName: "Trees", duration: "45:30" },
  { episodeNumber: 82, title: "One Pattern To Solve Any Tree Question On Leetcode!", patternName: "Trees", duration: "23:41" },
  { episodeNumber: 83, title: "Tree Series Ep-05: Check for Symmetrical Binary Trees | C++ | Java", patternName: "Trees", duration: "39:52" },
  { episodeNumber: 84, title: "Better Than STRIVER ! LCA in Binary TREE Explanation with Intuition", patternName: "Trees", duration: "27:42" },
  { episodeNumber: 85, title: "Introduction to Binary Search Tree! Don't Miss", patternName: "Trees", duration: "23:32" },
  { episodeNumber: 86, title: "LCA in Binary Search Tree – Don't Miss This Trick! | Trees Ep 08 | DSA Series", patternName: "Trees", duration: "21:11" },
  { episodeNumber: 87, title: "Definitely Better Than Striver.. Two Sum in Binary search Tree!", patternName: "Trees", duration: "56:42" },
  { episodeNumber: 88, title: "Path Sum Problem in 5 Minutes - No Confusion", patternName: "Trees", duration: "30:32" },
  { episodeNumber: 89, title: "Diameter of Binary Tree | Check Complete Binary Tree | Tree DSA Series", patternName: "Trees", duration: "43:56" },
  { episodeNumber: 90, title: "The BST Validation Problem Everyone Gets Wrong", patternName: "Trees", duration: "42:11" },
  { episodeNumber: 91, title: "Tree Series Last Video Construct a Binary Tree from Preorder and Inorder Traversal", patternName: "Trees", duration: "27:55" },

  // ─── Graphs (Ep 89–105) ───────────────────────────────────
  { episodeNumber: 92, title: "Intro To Graphs DSA Pattern | Master Graphs in 12 Days | Zero", patternName: "Graphs", duration: "20:45" },
  { episodeNumber: 93, title: "Graph Representation: Adjacency Matrix vs Adjacency List – Which is Better?", patternName: "Graphs", duration: "39:46" },
  { episodeNumber: 94, title: "Master DFS/BFS in Graphs | Graph series DSA Patterns", patternName: "Graphs", duration: "46:58" },
  { episodeNumber: 95, title: "Most Asked Graphs Question in FAANG Interviews | Number of Islands Leetcode", patternName: "Graphs", duration: "37:49" },
  { episodeNumber: 96, title: "Rotten Oranges: Multi-Source BFS | Graph Series", patternName: "Graphs", duration: "36:00" },
  { episodeNumber: 97, title: "DFS Cycle Detection | From Basics to Advanced | DSA Pattern Graph Series", patternName: "Graphs", duration: "49:38" },
  { episodeNumber: 98, title: "No one has explained Topological sort like This!", patternName: "Graphs", duration: "32:46" },
  { episodeNumber: 99, title: "The Graph Algorithm Used In Amazon! Bipartite graph/ Graph Coloring| CPP JAVA Python", patternName: "Graphs", duration: "23:39" },
  { episodeNumber: 100, title: "Easiest Graphs question Surrounded Regions | DSA Patterns 2026", patternName: "Graphs", duration: "17:24" },
  { episodeNumber: 101, title: "Graph Series Episode 10 - Shortest Path In Non Weighted graph", patternName: "Graphs", duration: "29:30" },
  { episodeNumber: 102, title: "No one Has Explained Dijkstra's Algorithm Like This On The Internet!", patternName: "Graphs", duration: "51:57" },
  { episodeNumber: 103, title: "2 Of The Most Important Questions in Dijkstra's Algorithm | Graph series DSA Patterns 2026", patternName: "Graphs", duration: "43:14" },
  { episodeNumber: 104, title: "We Crossed 50K! Let's Study Bellman-Ford NOW", patternName: "Graphs", duration: "34:53" },
  { episodeNumber: 105, title: "Graph Leetcode Hard Question Explained Like Crazy! Swim in Rising Water Leetcode", patternName: "Graphs", duration: "35:47" },
  { episodeNumber: 106, title: "Prim's Algorithm - Minimum Spanning Tree - C++ JAVA DSA Patterns Graph Series 2026", patternName: "Graphs", duration: "41:33" },
  { episodeNumber: 107, title: "Master Bellman-Ford: Cheapest Flights Within K Stops", patternName: "Graphs", duration: "32:34" },
  { episodeNumber: 108, title: "Word Ladder Explained Like a Pro! DSA Patterns Graph Series", patternName: "Graphs", duration: "31:39" },

  // ─── Dynamic Programming (Ep 106–111) ─────────────────────
  { episodeNumber: 109, title: "Introduction To Dynamic Programming | Dynamic Programming in 15 days", patternName: "Dynamic Programming", duration: "16:16" },
  { episodeNumber: 110, title: "DP Series Episode-2 : When And How To Use DP", patternName: "Dynamic Programming", duration: "31:07" },
  { episodeNumber: 111, title: "DP in 15 Days Episode 3: Climbing Stairs | Learn 1D Dynamic Programming", patternName: "Dynamic Programming", duration: "40:32" },
  { episodeNumber: 112, title: "DP Series - House Robber", patternName: "Dynamic Programming", duration: "40:32" },
  { episodeNumber: 113, title: "DP In 15 Days Episode 5 : 0/1 Knapsack | Master Dynamic Programming", patternName: "Dynamic Programming", duration: "21:31" },
  { episodeNumber: 114, title: "DP in 15 Days Episode 06 : No One Has Explained Tabulation Like This", patternName: "Dynamic Programming", duration: "34:27" },
];
