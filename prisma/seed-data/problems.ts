// Seed data: All problems extracted from Sheet.pdf
// Each problem maps to a pattern name (resolved at seed time)

export interface SeedProblem {
  title: string;
  patternName: string;
  subPattern?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  platform: "LEETCODE" | "GFG" | "OTHER";
  url: string;
  isChallenge?: boolean;
  isHomework?: boolean;
}

export const problems: SeedProblem[] = [
  // ═══════════════════════════════════════════════════════════════
  // PATTERN 1: TWO POINTERS
  // ═══════════════════════════════════════════════════════════════
  { title: "Pair with Target Sum", patternName: "Two Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
  { title: "Rearrange 0 and 1", patternName: "Two Pointers", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1" },
  { title: "Remove Duplicates", patternName: "Two Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list/" },
  { title: "Squaring a Sorted Array", patternName: "Two Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/squares-of-a-sorted-array/" },
  { title: "Triplet Sum to Zero", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/3sum/" },
  { title: "Triplet Sum Close to Target", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/3sum-closest/" },
  { title: "Triplets with Smaller Sum", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1" },
  { title: "Subarrays with Product Less than Target", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/subarray-product-less-than-k/" },
  { title: "Sort Colors (Dutch National Flag)", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/sort-colors/" },
  { title: "Quadruple Sum to Target", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/4sum/", isChallenge: true },
  { title: "Comparing Strings containing Backspaces", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/backspace-string-compare/", isChallenge: true },
  { title: "Minimum Window Sort", patternName: "Two Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // PATTERN 2: FAST & SLOW POINTERS
  // ═══════════════════════════════════════════════════════════════
  { title: "LinkedList Cycle", patternName: "Fast & Slow Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/linked-list-cycle/" },
  { title: "Start of LinkedList Cycle", patternName: "Fast & Slow Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
  { title: "Happy Number", patternName: "Fast & Slow Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/happy-number/" },
  { title: "Find Duplicate Number", patternName: "Fast & Slow Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/find-the-duplicate-number/" },
  { title: "Middle of the LinkedList", patternName: "Fast & Slow Pointers", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/middle-of-the-linked-list/" },
  { title: "Palindrome LinkedList", patternName: "Fast & Slow Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/palindrome-linked-list/", isChallenge: true },
  { title: "Rearrange a LinkedList", patternName: "Fast & Slow Pointers", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/reorder-list/", isChallenge: true },
  { title: "Cycle in a Circular Array", patternName: "Fast & Slow Pointers", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/circular-array-loop/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // PATTERN 3: SLIDING WINDOW
  // ═══════════════════════════════════════════════════════════════
  { title: "Maximum Sum Subarray of Size K", patternName: "Sliding Window", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1" },
  { title: "Smallest Subarray with given sum", patternName: "Sliding Window", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
  { title: "Longest Substring with K Distinct Characters", patternName: "Sliding Window", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1" },
  { title: "Fruits into Baskets", patternName: "Sliding Window", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/fruit-into-baskets/" },
  { title: "No-repeat Substring", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { title: "Longest Substring with Same Letters after Replacement", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
  { title: "Longest Subarray with Ones after Replacement", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/max-consecutive-ones-iii/" },
  { title: "Maximum size subarray SUM", patternName: "Sliding Window", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
  { title: "Minimum Size Substring", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-window-substring/" },
  { title: "Permutation in a String", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/permutation-in-string/", isChallenge: true },
  { title: "String Anagrams", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", isChallenge: true },
  { title: "Words Concatenation", patternName: "Sliding Window", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // KADANE'S ALGORITHM
  // ═══════════════════════════════════════════════════════════════
  { title: "Maximum Subarray Sum", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-subarray/" },
  { title: "Smallest Sum Contiguous Subarray", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/" },
  { title: "Maximum Product Subarray", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-product-subarray/" },
  { title: "Maximum Subarray Sum with One Deletion", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/" },
  { title: "Maximum Absolute Sum of Any Subarray", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/" },
  { title: "Maximum Sum Circular Subarray", patternName: "Kadane's Algorithm", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-sum-circular-subarray/" },

  // ═══════════════════════════════════════════════════════════════
  // PREFIX SUM
  // ═══════════════════════════════════════════════════════════════
  { title: "Subarray Sum Equals K", patternName: "Prefix Sum", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/subarray-sum-equals-k/" },
  { title: "Find Pivot Index", patternName: "Prefix Sum", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/find-pivot-index/" },
  { title: "Subarray Sums Divisible by K", patternName: "Prefix Sum", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/" },
  { title: "Contiguous Array", patternName: "Prefix Sum", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/contiguous-array/" },
  { title: "Shortest Subarray With Sum at Least K", patternName: "Prefix Sum", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/", isChallenge: true },
  { title: "Count Range Sum", patternName: "Prefix Sum", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/count-of-range-sum/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // MERGE INTERVALS
  // ═══════════════════════════════════════════════════════════════
  { title: "Merge Intervals", patternName: "Merge Intervals", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/merge-intervals/" },
  { title: "Insert Interval", patternName: "Merge Intervals", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/insert-interval/" },
  { title: "Intervals Intersection", patternName: "Merge Intervals", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/interval-list-intersections/" },
  { title: "Overlapping Intervals", patternName: "Merge Intervals", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/" },
  { title: "Minimum Meeting Rooms", patternName: "Merge Intervals", difficulty: "HARD", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1", isChallenge: true },
  { title: "Maximum CPU Load", patternName: "Merge Intervals", difficulty: "HARD", platform: "GFG", url: "https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/", isChallenge: true },
  { title: "Employee Free Time", patternName: "Merge Intervals", difficulty: "HARD", platform: "OTHER", url: "https://www.codetrails.co/employee-free-time", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // IN-PLACE REVERSAL OF LINKEDLIST
  // ═══════════════════════════════════════════════════════════════
  { title: "Reverse a LinkedList", patternName: "In-place Reversal of LinkedList", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/reverse-linked-list/" },
  { title: "Reverse a Sub-list", patternName: "In-place Reversal of LinkedList", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/reverse-linked-list-ii/" },
  { title: "Reverse List in Pairs", patternName: "In-place Reversal of LinkedList", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/swap-nodes-in-pairs/" },
  { title: "Reverse every K-element Sub-list", patternName: "In-place Reversal of LinkedList", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
  { title: "Reverse nodes in EVEN Length Groups", patternName: "In-place Reversal of LinkedList", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/", isChallenge: true },
  { title: "Rotate a LinkedList", patternName: "In-place Reversal of LinkedList", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/rotate-list/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // STACK
  // ═══════════════════════════════════════════════════════════════
  { title: "Remove Adjacent Duplicates", patternName: "Stack", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/" },
  { title: "Balanced Parentheses", patternName: "Stack", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/valid-parentheses/" },
  { title: "Next Greater Element", patternName: "Stack", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/next-greater-element-ii/" },
  { title: "Daily Temperatures", patternName: "Stack", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/daily-temperatures/" },
  { title: "Remove Nodes From Linked List", patternName: "Stack", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/remove-nodes-from-linked-list/" },
  { title: "Remove All Adjacent Duplicates in String II", patternName: "Stack", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/" },
  { title: "Simplify Path", patternName: "Stack", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/simplify-path/", isChallenge: true },
  { title: "Remove K Digits", patternName: "Stack", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/remove-k-digits/", isChallenge: true },

  // ═══════════════════════════════════════════════════════════════
  // HASH MAPS
  // ═══════════════════════════════════════════════════════════════
  { title: "First Non-repeating Character", patternName: "Hash Maps", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/first-unique-character-in-a-string/" },
  { title: "Maximum Number of Balloons", patternName: "Hash Maps", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-number-of-balloons/" },
  { title: "Longest Palindrome", patternName: "Hash Maps", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/longest-palindrome/" },
  { title: "Ransom Note", patternName: "Hash Maps", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/ransom-note/" },

  // ═══════════════════════════════════════════════════════════════
  // BINARY SEARCH
  // ═══════════════════════════════════════════════════════════════
  { title: "Binary Search", patternName: "Binary Search", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-search/" },
  { title: "Upper Bound / Ceiling", patternName: "Binary Search", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array-1/1" },
  { title: "First and Last Position", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
  { title: "Count Number of Occurrences", patternName: "Binary Search", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1" },
  { title: "Search in Infinite Sorted Array", patternName: "Binary Search", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/" },
  { title: "Find Peak in Mountain Range", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/find-peak-element/" },
  { title: "Find Minimum in Rotated Sorted Array", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { title: "Find Number of Rotations in Sorted Array", patternName: "Binary Search", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/rotation4723/1" },
  { title: "Search in Rotated Sorted Array", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { title: "KOKO Eating Bananas", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/koko-eating-bananas/" },
  { title: "Maximum Number of Days to Make M Bouquets", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/" },
  { title: "Aggressive Cows", patternName: "Binary Search", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/aggressive-cows/1" },
  { title: "H-Index II", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/h-index-ii/" },
  { title: "Max Candies to K Children", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/" },
  { title: "Capacity to Ship Packages in D Days", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/" },
  { title: "Book Allocation Problem", patternName: "Binary Search", difficulty: "HARD", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1" },
  { title: "Split Largest Array", patternName: "Binary Search", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/split-array-largest-sum/" },
  { title: "Search 2D Matrix", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
  { title: "Search 2D Matrix II", patternName: "Binary Search", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/search-a-2d-matrix-ii/" },
  { title: "Kth Smallest in Sorted Matrix", patternName: "Binary Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" },
  { title: "Kth Smallest in Multiplication Matrix", patternName: "Binary Search", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/" },
  { title: "Median of Two Sorted Arrays", patternName: "Binary Search", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },

  // ═══════════════════════════════════════════════════════════════
  // HEAP
  // ═══════════════════════════════════════════════════════════════
  { title: "Kth Smallest Element", patternName: "Heap", subPattern: "Kth", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1" },
  { title: "Kth Largest Element in an Array", patternName: "Heap", subPattern: "Kth", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
  { title: "Top K Frequent Elements", patternName: "Heap", subPattern: "Top K", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
  { title: "Top K Frequent Words", patternName: "Heap", subPattern: "Top K", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/top-k-frequent-words/" },
  { title: "K Closest Points to Origin", patternName: "Heap", subPattern: "K Closest", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
  { title: "Find K Closest Elements", patternName: "Heap", subPattern: "K Closest", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/find-k-closest-elements/" },
  { title: "Kth Weakest Row in Matrix", patternName: "Heap", subPattern: "K Closest", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/" },
  { title: "Merge K Sorted Arrays", patternName: "Heap", subPattern: "Heap as Pointer", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1" },
  { title: "Kth Smallest in Sorted Matrix (Heap)", patternName: "Heap", subPattern: "Heap as Pointer", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/" },
  { title: "Last Stone Weight", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/last-stone-weight/" },
  { title: "CPU Task Scheduler", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/task-scheduler/" },
  { title: "Reorganize String", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/reorganize-string/" },
  { title: "Minimum Number of Refueling Stops", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/" },
  { title: "IPO", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/ipo/" },
  { title: "Course Schedule III", patternName: "Heap", subPattern: "Greedy + Heap", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/course-schedule-iii/" },
  { title: "Find Median from Data Stream", patternName: "Heap", subPattern: "Two Heaps", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/find-median-from-data-stream/" },
  { title: "Sliding Window Median", patternName: "Heap", subPattern: "Two Heaps", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/sliding-window-median/" },

  // ═══════════════════════════════════════════════════════════════
  // RECURSION & BACKTRACKING
  // ═══════════════════════════════════════════════════════════════
  { title: "Fibonacci Number", patternName: "Recursion & Backtracking", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/fibonacci-number/" },
  { title: "Check if String is Palindrome", patternName: "Recursion & Backtracking", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/palindrome-string0817/1" },
  { title: "Check if Array is Sorted", patternName: "Recursion & Backtracking", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1" },
  { title: "Sum of Digits of a Number", patternName: "Recursion & Backtracking", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/sum-of-digits1742/1" },
  { title: "Remove Occurrences of a Character in String", patternName: "Recursion & Backtracking", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1" },
  { title: "Generate Parentheses", patternName: "Recursion & Backtracking", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/generate-parentheses/" },
  { title: "Letter Combinations of a Phone Number", patternName: "Recursion & Backtracking", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
  { title: "Permutations", patternName: "Recursion & Backtracking", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/permutations/" },
  { title: "Combination Sum", patternName: "Recursion & Backtracking", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/combination-sum/" },
  { title: "Palindrome Partitioning", patternName: "Recursion & Backtracking", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/palindrome-partitioning/" },

  // ═══════════════════════════════════════════════════════════════
  // TREES
  // ═══════════════════════════════════════════════════════════════
  { title: "Binary Tree Inorder Traversal", patternName: "Trees", subPattern: "Traversal", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
  { title: "Binary Tree Preorder Traversal", patternName: "Trees", subPattern: "Traversal", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-preorder-traversal/" },
  { title: "Binary Tree Postorder Traversal", patternName: "Trees", subPattern: "Traversal", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-postorder-traversal/", isHomework: true },
  { title: "Binary Tree Level Order Traversal", patternName: "Trees", subPattern: "Traversal", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { title: "Binary Tree Zigzag Level Order Traversal", patternName: "Trees", subPattern: "Traversal", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
  { title: "Binary Tree Level Order Traversal II", patternName: "Trees", subPattern: "Traversal", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/", isHomework: true },
  { title: "Invert Binary Tree", patternName: "Trees", subPattern: "Mirror & Symmetry", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/invert-binary-tree/" },
  { title: "Symmetric Tree", patternName: "Trees", subPattern: "Mirror & Symmetry", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/symmetric-tree/" },
  { title: "Same Tree", patternName: "Trees", subPattern: "Mirror & Symmetry", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/same-tree/", isHomework: true },
  { title: "Subtree of Another Tree", patternName: "Trees", subPattern: "Mirror & Symmetry", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/subtree-of-another-tree/" },
  { title: "Flip Equivalent Binary Trees", patternName: "Trees", subPattern: "Mirror & Symmetry", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/flip-equivalent-binary-trees/" },
  { title: "LCA of Binary Tree", patternName: "Trees", subPattern: "Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
  { title: "Search in a Binary Search Tree", patternName: "Trees", subPattern: "Search", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/search-in-a-binary-search-tree/" },
  { title: "LCA of BST", patternName: "Trees", subPattern: "Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
  { title: "LCA of Deepest Leaves", patternName: "Trees", subPattern: "Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/" },
  { title: "Two Sum IV - BST", patternName: "Trees", subPattern: "Search", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/" },
  { title: "Kth Smallest Element in a BST", patternName: "Trees", subPattern: "Search", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
  { title: "Minimum Depth of Binary Tree", patternName: "Trees", subPattern: "Validation", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/" },
  { title: "Maximum Depth of Binary Tree", patternName: "Trees", subPattern: "Validation", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { title: "Balanced Binary Tree", patternName: "Trees", subPattern: "Validation", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/balanced-binary-tree/" },
  { title: "Diameter of Binary Tree", patternName: "Trees", subPattern: "Validation", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/diameter-of-binary-tree/" },
  { title: "Check Completeness of Binary Tree", patternName: "Trees", subPattern: "Validation", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/check-completeness-of-a-binary-tree/" },
  { title: "Validate BST", patternName: "Trees", subPattern: "Validation", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { title: "Recover BST", patternName: "Trees", subPattern: "Validation", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/recover-binary-search-tree/" },
  { title: "Path Sum", patternName: "Trees", subPattern: "Path Sum", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/path-sum/" },
  { title: "Path Sum II", patternName: "Trees", subPattern: "Path Sum", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/path-sum-ii/" },
  { title: "Sum Root to Leaf Numbers", patternName: "Trees", subPattern: "Path Sum", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/sum-root-to-leaf-numbers/" },
  { title: "Binary Tree Maximum Path Sum", patternName: "Trees", subPattern: "Path Sum", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
  { title: "Construct Tree from Preorder and Inorder", patternName: "Trees", subPattern: "Construction", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
  { title: "Construct Tree from Postorder and Inorder", patternName: "Trees", subPattern: "Construction", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/" },
  { title: "Convert Sorted Array to BST", patternName: "Trees", subPattern: "Construction", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/" },

  // ═══════════════════════════════════════════════════════════════
  // GRAPHS
  // ═══════════════════════════════════════════════════════════════
  { title: "Construct Adjacency List from Edges", patternName: "Graphs", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1" },
  { title: "Graph DFS", patternName: "Graphs", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1" },
  { title: "Graph BFS", patternName: "Graphs", difficulty: "EASY", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1" },
  { title: "Number of Islands", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/number-of-islands/" },
  { title: "Number of Provinces", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/number-of-provinces/" },
  { title: "Rotting Oranges", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/rotting-oranges/" },
  { title: "Cycle Detection in Undirected Graph", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1" },
  { title: "Cycle Detection in Directed Graph", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1" },
  { title: "Topological Sort", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/topological-sort/1" },
  { title: "Bipartite Graph / Graph Coloring", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/is-graph-bipartite/" },
  { title: "Surrounded Regions", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/surrounded-regions/" },
  { title: "Shortest Path in Non-Weighted Graph", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1" },
  { title: "Dijkstra's Algorithm", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1" },
  { title: "Network Delay Time", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/network-delay-time/" },
  { title: "Path With Minimum Effort", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/path-with-minimum-effort/" },
  { title: "Swim in Rising Water", patternName: "Graphs", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/swim-in-rising-water/" },
  { title: "Bellman-Ford Algorithm", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1" },
  { title: "Cheapest Flights Within K Stops", patternName: "Graphs", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },
  { title: "Prim's MST", patternName: "Graphs", difficulty: "MEDIUM", platform: "GFG", url: "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1" },
  { title: "Word Ladder", patternName: "Graphs", difficulty: "HARD", platform: "LEETCODE", url: "https://leetcode.com/problems/word-ladder/" },

  // ═══════════════════════════════════════════════════════════════
  // DYNAMIC PROGRAMMING
  // ═══════════════════════════════════════════════════════════════
  { title: "Fibonacci Number (DP)", patternName: "Dynamic Programming", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/fibonacci-number/" },
  { title: "Climbing Stairs", patternName: "Dynamic Programming", difficulty: "EASY", platform: "LEETCODE", url: "https://leetcode.com/problems/climbing-stairs/" },
  { title: "House Robber", patternName: "Dynamic Programming", difficulty: "MEDIUM", platform: "LEETCODE", url: "https://leetcode.com/problems/house-robber/" },
];
