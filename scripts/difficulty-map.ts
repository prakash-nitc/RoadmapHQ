// Canonical LeetCode / GeeksForGeeks difficulty for problems that were
// seeded without a difficulty. Keyed by the (cleaned) problem URL.
// Sources: LeetCode problem pages + GfG problem difficulty labels.

export const DIFFICULTY_BY_URL: Record<string, "EASY" | "MEDIUM" | "HARD"> = {
  // ─── Two Pointers ───
  "https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1": "EASY",

  // ─── Kadane / subarrays ───
  "https://leetcode.com/problems/minimum-size-subarray-sum/": "MEDIUM",
  "https://leetcode.com/problems/maximum-subarray/": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/": "MEDIUM",
  "https://leetcode.com/problems/maximum-product-subarray/": "MEDIUM",
  "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/": "MEDIUM",
  "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/": "MEDIUM",
  "https://leetcode.com/problems/maximum-sum-circular-subarray/": "MEDIUM",

  // ─── Merge Intervals ───
  "https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/": "MEDIUM",

  // ─── Stack ───
  "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/": "EASY",
  "https://leetcode.com/problems/valid-parentheses/": "EASY",
  "https://leetcode.com/problems/next-greater-element-ii/": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/next-larger-element-1587115620/1": "MEDIUM",
  "https://leetcode.com/problems/remove-nodes-from-linked-list/": "MEDIUM",
  "https://leetcode.com/problems/simplify-path/": "MEDIUM",

  // ─── Binary Search ───
  "https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array-1/1": "EASY",
  "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1": "EASY",
  "https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/": "MEDIUM",
  "https://leetcode.com/problems/find-peak-element/": "MEDIUM",
  "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/rotation4723/1": "EASY",
  "https://www.geeksforgeeks.org/problems/aggressive-cows/1": "MEDIUM",
  "https://leetcode.com/problems/h-index-ii/": "MEDIUM",
  "https://leetcode.com/problems/maximum-candies-allocated-to-k-children/": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1": "HARD",
  "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/": "MEDIUM",

  // ─── Heap ───
  "https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1": "MEDIUM",
  "https://leetcode.com/problems/kth-largest-element-in-an-array/": "MEDIUM",
  "https://leetcode.com/problems/top-k-frequent-elements/": "MEDIUM",
  "https://leetcode.com/problems/top-k-frequent-words/": "MEDIUM",
  "https://leetcode.com/problems/k-closest-points-to-origin/": "MEDIUM",
  "https://leetcode.com/problems/find-k-closest-elements/": "MEDIUM",
  "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/": "EASY",
  "https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1": "MEDIUM",
  "https://leetcode.com/problems/last-stone-weight/": "EASY",
  "https://leetcode.com/problems/task-scheduler/": "MEDIUM",
  "https://leetcode.com/problems/reorganize-string/": "MEDIUM",
  "https://leetcode.com/problems/minimum-number-of-refueling-stops/": "HARD",
  "https://leetcode.com/problems/ipo/": "HARD",
  "https://leetcode.com/problems/course-schedule-iii/": "HARD",

  // ─── Trees ───
  "https://leetcode.com/problems/binary-tree-inorder-traversal/": "EASY",
  "https://leetcode.com/problems/binary-tree-preorder-traversal/": "EASY",
  "https://leetcode.com/problems/binary-tree-postorder-traversal/": "EASY",
  "https://leetcode.com/problems/binary-tree-level-order-traversal/": "MEDIUM",
  "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/": "MEDIUM",
  "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/": "MEDIUM",
  "https://leetcode.com/problems/invert-binary-tree/": "EASY",
  "https://leetcode.com/problems/symmetric-tree/": "EASY",
  "https://leetcode.com/problems/same-tree/": "EASY",
  "https://leetcode.com/problems/subtree-of-another-tree/": "EASY",
  "https://leetcode.com/problems/flip-equivalent-binary-trees/": "MEDIUM",
  "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/": "MEDIUM",
  "https://leetcode.com/problems/search-in-a-binary-search-tree/": "EASY",
  "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/": "MEDIUM",
  "https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/": "MEDIUM",
  "https://leetcode.com/problems/two-sum-iv-input-is-a-bst/": "EASY",
  "https://leetcode.com/problems/kth-smallest-element-in-a-bst/": "MEDIUM",
  "https://leetcode.com/problems/minimum-depth-of-binary-tree/": "EASY",
  "https://leetcode.com/problems/maximum-depth-of-binary-tree/": "EASY",
  "https://leetcode.com/problems/balanced-binary-tree/": "EASY",
  "https://leetcode.com/problems/diameter-of-binary-tree/": "EASY",
  "https://leetcode.com/problems/check-completeness-of-a-binary-tree/": "MEDIUM",
  "https://leetcode.com/problems/validate-binary-search-tree/": "MEDIUM",
  "https://leetcode.com/problems/recover-binary-search-tree/": "MEDIUM",
  "https://leetcode.com/problems/path-sum/": "EASY",
  "https://leetcode.com/problems/path-sum-ii/": "MEDIUM",
  "https://leetcode.com/problems/sum-root-to-leaf-numbers/": "MEDIUM",

  // ─── Graphs (GfG) ───
  "https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1": "EASY",
  "https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1": "EASY",
  "https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1": "EASY",
  "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/topological-sort/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1": "MEDIUM",
  "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1": "MEDIUM",
};
