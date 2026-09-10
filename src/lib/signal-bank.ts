// Signal bank for the Identification Drill.
//
// Each entry is a neutral, OA-style problem statement with the TITLE and the
// PATTERN NAME deliberately stripped. The drill shows `text`; the solver must
// recognise which pattern applies (`pattern` is the ground truth). Written to
// describe the SIGNAL (constraints, what's asked) the way a real OA reads —
// never "use two pointers here". Pattern names match the DB exactly.

export interface Signal {
  pattern: string;
  text: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export const SIGNAL_BANK: Signal[] = [
  // ── Two Pointers ──
  { pattern: "Two Pointers", difficulty: "MEDIUM", text: "Given a sorted array, return all unique triplets that sum to zero. Do it without extra space beyond the output and better than O(n²) brute force over every triple." },
  { pattern: "Two Pointers", difficulty: "EASY", text: "You're given an array of 0s, 1s and 2s. Sort it in a single pass, in place, without counting and rewriting." },
  { pattern: "Two Pointers", difficulty: "MEDIUM", text: "Given an array of heights, pick two lines that together with the x-axis form a container holding the most water. O(n)." },
  { pattern: "Two Pointers", difficulty: "EASY", text: "A sorted array is given; determine if any two elements add up to a target. Constant extra space." },
  { pattern: "Two Pointers", difficulty: "MEDIUM", text: "Count how many contiguous subarrays of positive integers have a product strictly less than K." },

  // ── Fast & Slow Pointers ──
  { pattern: "Fast & Slow Pointers", difficulty: "EASY", text: "Determine whether a singly linked list contains a cycle, using O(1) extra memory." },
  { pattern: "Fast & Slow Pointers", difficulty: "MEDIUM", text: "An array of n+1 integers each in [1, n] is given. Exactly one value repeats. Find it without modifying the array and in constant space." },
  { pattern: "Fast & Slow Pointers", difficulty: "EASY", text: "Find the middle node of a singly linked list in one pass, without knowing its length in advance." },
  { pattern: "Fast & Slow Pointers", difficulty: "MEDIUM", text: "A linked list has a cycle; return the node where the cycle begins, using O(1) space." },
  { pattern: "Fast & Slow Pointers", difficulty: "EASY", text: "Check whether a singly linked list reads the same forwards and backwards, ideally in O(1) space." },

  // ── Sliding Window ──
  { pattern: "Sliding Window", difficulty: "MEDIUM", text: "Find the length of the longest substring with no repeating characters." },
  { pattern: "Sliding Window", difficulty: "MEDIUM", text: "Given a string and an integer k, find the longest substring you can get where at most k character replacements make all letters the same." },
  { pattern: "Sliding Window", difficulty: "EASY", text: "Given positive integers and a target S, return the length of the smallest contiguous subarray whose sum is ≥ S." },
  { pattern: "Sliding Window", difficulty: "MEDIUM", text: "Return the maximum average of any contiguous subarray of fixed length k." },
  { pattern: "Sliding Window", difficulty: "HARD", text: "Find the minimum window in string S that contains every character of string T (with multiplicity)." },

  // ── Kadane's Algorithm ──
  { pattern: "Kadane's Algorithm", difficulty: "EASY", text: "Find the contiguous subarray with the largest sum in an array that may contain negative numbers. O(n), O(1)." },
  { pattern: "Kadane's Algorithm", difficulty: "MEDIUM", text: "Find the contiguous subarray with the largest product, where the array can contain negatives and zeros." },
  { pattern: "Kadane's Algorithm", difficulty: "MEDIUM", text: "The array is circular (the ends wrap around). Find the maximum possible sum of a non-empty contiguous subarray." },
  { pattern: "Kadane's Algorithm", difficulty: "MEDIUM", text: "You may complete one buy and one sell of a stock; maximize profit given daily prices, scanning once." },

  // ── Prefix Sum ──
  { pattern: "Prefix Sum", difficulty: "MEDIUM", text: "Count the number of contiguous subarrays whose sum equals exactly k (values may be negative)." },
  { pattern: "Prefix Sum", difficulty: "MEDIUM", text: "Given a binary array, find the longest contiguous subarray with an equal number of 0s and 1s." },
  { pattern: "Prefix Sum", difficulty: "MEDIUM", text: "Count contiguous subarrays whose sum is divisible by k." },
  { pattern: "Prefix Sum", difficulty: "EASY", text: "Answer many queries of the form 'sum of elements between index i and j' on a fixed array, each in O(1)." },
  { pattern: "Prefix Sum", difficulty: "HARD", text: "In a 2D matrix, answer repeated queries for the sum of any axis-aligned rectangle in O(1) after preprocessing." },

  // ── Merge Intervals ──
  { pattern: "Merge Intervals", difficulty: "MEDIUM", text: "Given a collection of intervals, merge all that overlap and return the non-overlapping set." },
  { pattern: "Merge Intervals", difficulty: "MEDIUM", text: "Given meeting time intervals, find the minimum number of rooms required to hold all meetings." },
  { pattern: "Merge Intervals", difficulty: "MEDIUM", text: "Insert a new interval into a sorted list of non-overlapping intervals, merging as needed." },
  { pattern: "Merge Intervals", difficulty: "EASY", text: "Given intervals, determine whether a person could attend all meetings (no two overlap)." },
  { pattern: "Merge Intervals", difficulty: "HARD", text: "Given a list of employees' free/busy intervals, return the common free-time slots for everyone." },

  // ── In-place Reversal of LinkedList ──
  { pattern: "In-place Reversal of LinkedList", difficulty: "EASY", text: "Reverse a singly linked list in place, in O(1) extra space." },
  { pattern: "In-place Reversal of LinkedList", difficulty: "MEDIUM", text: "Reverse the nodes of a linked list between positions m and n in a single pass, in place." },
  { pattern: "In-place Reversal of LinkedList", difficulty: "HARD", text: "Reverse the nodes of a linked list k at a time; leftover nodes at the end stay as they are." },
  { pattern: "In-place Reversal of LinkedList", difficulty: "MEDIUM", text: "Rotate a linked list to the right by k places without using extra nodes." },
  { pattern: "In-place Reversal of LinkedList", difficulty: "MEDIUM", text: "Reorder a list L0→L1→…→Ln into L0→Ln→L1→Ln-1→… in place." },

  // ── Stack ──
  { pattern: "Stack", difficulty: "EASY", text: "Given daily temperatures, for each day output how many days until a warmer one. O(n)." },
  { pattern: "Stack", difficulty: "MEDIUM", text: "For each element in an array, find the next element to its right that is greater than it." },
  { pattern: "Stack", difficulty: "EASY", text: "Check whether a string of brackets '()[]{}' is validly opened and closed in the right order." },
  { pattern: "Stack", difficulty: "HARD", text: "Given bar heights, find the area of the largest rectangle that fits under the histogram." },
  { pattern: "Stack", difficulty: "MEDIUM", text: "Evaluate an arithmetic expression given in Reverse Polish Notation." },

  // ── Hash Maps ──
  { pattern: "Hash Maps", difficulty: "EASY", text: "Return indices of the two numbers in an unsorted array that add up to a target. O(n)." },
  { pattern: "Hash Maps", difficulty: "MEDIUM", text: "Group a list of strings so that all anagrams of one another are together." },
  { pattern: "Hash Maps", difficulty: "EASY", text: "Find the first non-repeating character in a string and return its index." },
  { pattern: "Hash Maps", difficulty: "MEDIUM", text: "Given an unsorted array, find the length of the longest run of consecutive integers, in O(n)." },
  { pattern: "Hash Maps", difficulty: "EASY", text: "Determine whether a ransom note can be built from the letters available in a magazine string." },

  // ── Binary Search ──
  { pattern: "Binary Search", difficulty: "MEDIUM", text: "Search a target in an array that was sorted then rotated at an unknown pivot, in O(log n)." },
  { pattern: "Binary Search", difficulty: "MEDIUM", text: "Given piles of bananas and h hours, find the smallest eating speed that finishes all piles in time." },
  { pattern: "Binary Search", difficulty: "HARD", text: "Split an array into m contiguous parts so the largest part-sum is as small as possible; return that value." },
  { pattern: "Binary Search", difficulty: "EASY", text: "Find the first and last position of a target value in a sorted array with duplicates, in O(log n)." },
  { pattern: "Binary Search", difficulty: "HARD", text: "Allocate books to students to minimize the maximum pages any single student reads." },

  // ── Heap ──
  { pattern: "Heap", difficulty: "MEDIUM", text: "Return the k most frequent elements in an array, better than sorting everything." },
  { pattern: "Heap", difficulty: "MEDIUM", text: "Find the kth largest element in an unsorted array without fully sorting it." },
  { pattern: "Heap", difficulty: "HARD", text: "Merge k sorted linked lists into one sorted list efficiently." },
  { pattern: "Heap", difficulty: "HARD", text: "Support inserting numbers from a stream and querying the running median at any time." },
  { pattern: "Heap", difficulty: "MEDIUM", text: "Rearrange a string so that no two adjacent characters are the same, using the most frequent ones first." },

  // ── Recursion & Backtracking ──
  { pattern: "Recursion & Backtracking", difficulty: "MEDIUM", text: "Return all possible orderings of a list of distinct numbers." },
  { pattern: "Recursion & Backtracking", difficulty: "MEDIUM", text: "Given candidate numbers (reusable) and a target, return all unique combinations that sum to the target." },
  { pattern: "Recursion & Backtracking", difficulty: "MEDIUM", text: "Partition a string so that every substring of the partition is a palindrome; return all such partitions." },
  { pattern: "Recursion & Backtracking", difficulty: "HARD", text: "Place N queens on an N×N board so that none attack each other; return all valid configurations." },
  { pattern: "Recursion & Backtracking", difficulty: "MEDIUM", text: "Given a board of letters, find whether a word can be formed by adjacent cells without reusing a cell." },

  // ── Trees ──
  { pattern: "Trees", difficulty: "MEDIUM", text: "Return the node values of a binary tree level by level, each level as its own list." },
  { pattern: "Trees", difficulty: "EASY", text: "Compute the maximum depth of a binary tree." },
  { pattern: "Trees", difficulty: "MEDIUM", text: "Validate whether a binary tree satisfies the binary-search-tree ordering everywhere." },
  { pattern: "Trees", difficulty: "EASY", text: "Determine whether a binary tree is a mirror image of itself around its center." },
  { pattern: "Trees", difficulty: "MEDIUM", text: "Find the lowest common ancestor of two nodes in a binary tree." },

  // ── Graphs ──
  { pattern: "Graphs", difficulty: "MEDIUM", text: "Given a grid of land and water cells, count how many separate islands there are." },
  { pattern: "Graphs", difficulty: "MEDIUM", text: "Given course prerequisites, return an order to take all courses, or report it's impossible." },
  { pattern: "Graphs", difficulty: "MEDIUM", text: "Count the number of connected friend-groups given an adjacency matrix of people." },
  { pattern: "Graphs", difficulty: "HARD", text: "Find the shortest travel time from a source node to all others in a weighted graph with non-negative edges." },
  { pattern: "Graphs", difficulty: "MEDIUM", text: "Given a grid where each cell costs time to enter, find the minimum cost path from top-left to bottom-right moving 4-directionally." },

  // ── Dynamic Programming ──
  { pattern: "Dynamic Programming", difficulty: "MEDIUM", text: "Given coin denominations and an amount, find the fewest coins that make that amount, or -1." },
  { pattern: "Dynamic Programming", difficulty: "MEDIUM", text: "Find the length of the longest strictly increasing subsequence in an array." },
  { pattern: "Dynamic Programming", difficulty: "EASY", text: "Count the distinct ways to climb n stairs taking 1 or 2 steps at a time." },
  { pattern: "Dynamic Programming", difficulty: "MEDIUM", text: "Given item weights and values and a capacity, maximize value with each item taken at most once." },
  { pattern: "Dynamic Programming", difficulty: "MEDIUM", text: "Find the length of the longest common subsequence of two strings." },
  { pattern: "Dynamic Programming", difficulty: "HARD", text: "Given two strings, find the minimum number of insert/delete/replace edits to turn one into the other." },
];
