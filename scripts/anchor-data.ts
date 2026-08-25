// Anchor tiering + the one insight per problem — transcribed from
// Section 9 of the DSA Revision System (patterns 1-13). Keyed by the
// exact problem title as stored in the DB. Trees/Graphs/DP are added
// later per the doc's update instruction.

export interface Anchor {
  title: string;
  tier: "CORE" | "SUPPORT";
  insight: string;
}

export const ANCHORS: Anchor[] = [
  // ─── 1. Two Pointers ───
  { title: "Triplet Sum to Zero", tier: "CORE", insight: "Sort, fix index i, run two pointers on the remainder. Skip duplicates at BOTH the outer fix and inner pointers. O(n^2). Own this and 3Sum Closest / 4Sum / Triplets with Smaller Sum are all derivations." },
  { title: "Sort Colors (Dutch National Flag)", tier: "CORE", insight: "Three pointers: low, mid, high. Only advance mid when you swap with low or see a 1. Do NOT advance mid after swapping with high. Single pass, O(1) space." },
  { title: "Pair with Target Sum", tier: "CORE", insight: "Sorted array, pointers from both ends. Sum too small -> move left in. Too big -> move right in. The template all others extend." },
  { title: "Squaring a Sorted Array", tier: "SUPPORT", insight: "Largest absolute value is at one of the two ends. Fill the result array from the BACK. The counter-intuitive direction is the whole trick." },
  { title: "Subarrays with Product Less than Target", tier: "SUPPORT", insight: "Sliding-window flavoured. A valid window contributes (right - left + 1) new subarrays, not 1. That counting insight is the exam-worthy part." },
  { title: "Remove Duplicates", tier: "SUPPORT", insight: "Slow pointer marks the write position, fast pointer scans. The general in-place-compaction template." },
  { title: "Rearrange 0 and 1", tier: "SUPPORT", insight: "Slow pointer marks the write position, fast pointer scans. The general in-place-compaction template." },

  // ─── 2. Fast & Slow Pointers ───
  { title: "Start of LinkedList Cycle", tier: "CORE", insight: "After the meeting point, reset one pointer to head and advance both one step at a time; they meet at the cycle entry. State WHY (distance algebra), not just the steps." },
  { title: "Find Duplicate Number", tier: "CORE", insight: "Treat the array as a linked list where i -> nums[i]. A duplicate value guarantees a cycle. The array -> implicit-linked-list transfer is the real skill." },
  { title: "Palindrome LinkedList", tier: "SUPPORT", insight: "Find middle with fast/slow, reverse the second half, compare, then restore. Composite of two other patterns." },
  { title: "LinkedList Cycle", tier: "SUPPORT", insight: "Base template. Watch the null checks: while (fast != null && fast.next != null)." },
  { title: "Middle of the LinkedList", tier: "SUPPORT", insight: "Base template. Watch the null checks: while (fast != null && fast.next != null)." },
  { title: "Rearrange a LinkedList", tier: "SUPPORT", insight: "Find middle, reverse second half, interleave. Same three-step composite as Palindrome LinkedList." },

  // ─── 3. Sliding Window ───
  { title: "Longest Substring with Same Letters after Replacement", tier: "CORE", insight: "Track maxFreq inside the window and NEVER decrease it. Window valid while (windowLength - maxFreq) <= k. Why you don't shrink maxFreq is the hardest idea in the pattern - be able to explain it." },
  { title: "Smallest Subarray with given sum", tier: "CORE", insight: "Variable window: expand right always, shrink from left WHILE the condition still holds, recording the answer at each valid shrink. 'Shrink while valid' vs 'shrink while invalid' separates minimum-window from maximum-window problems." },
  { title: "No-repeat Substring", tier: "CORE", insight: "HashMap of char -> last index. On a repeat, jump left to max(left, lastIndex + 1). The max() guard against stale indices is the common bug." },
  { title: "Longest Substring with K Distinct Characters", tier: "SUPPORT", insight: "Frequency map + shrink while map.size() > k. Remove the key when count hits zero, or size() lies to you." },
  { title: "Maximum Sum Subarray of Size K", tier: "SUPPORT", insight: "Fixed window. The base template - 60 seconds, should be automatic." },
  { title: "Fruits into Baskets", tier: "SUPPORT", insight: "Identical to K Distinct with k = 2. Recognising this equivalence in an OA is worth minutes." },

  // ─── 4. Kadane's Algorithm ───
  { title: "Maximum Subarray Sum", tier: "CORE", insight: "current = max(x, current + x); best = max(best, current). State it as the DP recurrence dp[i] = max(a[i], dp[i-1] + a[i])." },
  { title: "Maximum Product Subarray", tier: "CORE", insight: "Track BOTH running max and running min, because a negative flips them. Swap on negative. This two-state idea recurs constantly in DP." },
  { title: "Maximum Sum Circular Subarray", tier: "CORE", insight: "Answer = max(normal Kadane, total - minimum subarray). Edge case: all-negative makes the second formula return 0 and be wrong - special-case it. That edge case is the whole interview question." },
  { title: "Maximum Subarray Sum with One Deletion", tier: "SUPPORT", insight: "Two states: best ending here with no deletion, best with one deletion used. Genuine 2-state DP - your DP on-ramp." },
  { title: "Smallest Sum Contiguous Subarray", tier: "SUPPORT", insight: "Kadane with min instead of max. Trivial once the base is owned." },

  // ─── 5. Prefix Sum ───
  { title: "Subarray Sum Equals K", tier: "CORE", insight: "Store prefixSum -> count in a map. At each index add map.get(prefix - k). Seed the map with (0 -> 1) before the loop, or you miss subarrays starting at index 0. That seeding line is the classic bug." },
  { title: "Subarray Sums Divisible by K", tier: "CORE", insight: "Group by prefix % k. In Java, ((sum % k) + k) % k to handle negative remainders. Forgetting the negative-mod fix is the standard failure." },
  { title: "Contiguous Array", tier: "CORE", insight: "Map 0 to -1, then it becomes 'longest subarray with sum zero'. The re-encoding trick - many problems reduce to a known one by relabelling." },
  { title: "Find Pivot Index", tier: "SUPPORT", insight: "left = total - left - current. Simple, but a good 60-second warm-up." },

  // ─── 6. Merge Intervals ───
  { title: "Merge Intervals", tier: "CORE", insight: "Sort by start. If current.start <= last.end, merge by extending last.end = max(last.end, current.end). The max() is required - a fully-contained interval otherwise shrinks the merge." },
  { title: "Minimum Meeting Rooms", tier: "CORE", insight: "Know BOTH: (a) min-heap of end times, (b) sweep line - separate and sort start/end arrays, walk with two pointers. Interviewers often ask for the second after the first." },
  { title: "Insert Interval", tier: "CORE", insight: "Three phases: entirely-before, the overlapping merge, entirely-after. Three explicit loops beat one branchy loop and are easier to defend." },
  { title: "Intervals Intersection", tier: "SUPPORT", insight: "Two sorted lists, two pointers. Overlap exists when max(startA, startB) <= min(endA, endB). Advance whichever interval ends first." },
  { title: "Overlapping Intervals", tier: "SUPPORT", insight: "Sort and compare adjacent. Base case for the pattern." },

  // ─── 7. In-place Reversal of LinkedList ───
  { title: "Reverse a LinkedList", tier: "CORE", insight: "prev / curr / next three-pointer walk. Write it in under 60 seconds with zero thought - the most-asked linked list operation in existence." },
  { title: "Reverse a Sub-list", tier: "CORE", insight: "Walk to position p-1, keep that node as the connection anchor, reverse k nodes, reattach both ends. Off-by-one errors live here - dry run on a 5-node list every revise." },
  { title: "Reverse every K-element Sub-list", tier: "CORE", insight: "The generalisation. If fewer than k nodes remain, leave them alone (check the variant). Loop the sub-list reversal with a moving anchor." },
  { title: "Rotate a LinkedList", tier: "SUPPORT", insight: "Find length, connect tail to head to form a circle, break at length - (k % length). The modulo is required for k > length." },
  { title: "Reverse List in Pairs", tier: "SUPPORT", insight: "Special case of every-K with k = 2. Do it to check that your general template works." },

  // ─── 8. Stack (Monotonic) ───
  { title: "Next Greater Element", tier: "CORE", insight: "Monotonic DECREASING stack of indices. While stack top's value < current, pop and assign current as its answer. Push current. One template, comparison flipped, generates all four variants." },
  { title: "Daily Temperatures", tier: "CORE", insight: "Same template, storing indices and answering with index distance. If you can state that Daily Temperatures and Next Greater Element are the same algorithm, you own the pattern." },
  { title: "Next Greater Element- II", tier: "CORE", insight: "Circular array: iterate 2n times using i % n, only push indices during the first pass. The 2n trick is a reusable device for circular problems." },
  { title: "Previous Smaller Element", tier: "SUPPORT", insight: "Mirror template - monotonic increasing stack. A building block for histogram problems." },
  { title: "Balanced Parentheses", tier: "SUPPORT", insight: "Base case. Should be automatic." },
  { title: "Remove All Adjacent Duplicates in String II", tier: "SUPPORT", insight: "Stack of (char, count) pairs. Teaches you to put a composite object on the stack rather than a bare character." },

  // ─── 9. Hash Maps ───
  { title: "First Non-repeating Character", tier: "SUPPORT", insight: "Two passes, or LinkedHashMap for one pass. Know getOrDefault(c, 0) + 1." },
  { title: "Longest Palindrome", tier: "SUPPORT", insight: "Count frequencies, sum the even parts, add 1 if any odd count exists. A counting-argument problem, not a data-structure one." },
  { title: "Ransom Note", tier: "SUPPORT", insight: "Frequency-map subtraction. Trivial." },
  { title: "Maximum Number of Balloons", tier: "SUPPORT", insight: "Frequency-map subtraction. Trivial." },

  // ─── 10. Binary Search ───
  { title: "KOKO Eating Bananas", tier: "CORE", insight: "Binary search on the ANSWER, not the array. Define a monotonic predicate feasible(x), find the boundary. Covers Capacity to Ship, Book Allocation, Aggressive Cows, M Bouquets, Split Largest Array, Max Candies. Own this one, own six." },
  { title: "Search in Rotated Sorted Array", tier: "CORE", insight: "At each step one half is guaranteed sorted. Determine which by comparing nums[low] to nums[mid], then decide if the target lies in that sorted half. Duplicates are a separate variant." },
  { title: "Upper Bound / Ceiling", tier: "CORE", insight: "The boundary-search template: low < high with a bias, never break early. Lower-bound vs upper-bound cold is a genuine differentiator. Practice writing both in one sitting." },
  { title: "First and Last Position", tier: "CORE", insight: "The boundary-search template: low < high with a bias, never break early. Getting lower-bound vs upper-bound right cold is the differentiator most candidates fumble." },
  { title: "Find Peak Element", tier: "CORE", insight: "Binary search on an UNSORTED array. Compare nums[mid] to nums[mid+1], move toward the ascent. The unlock: binary search needs a monotonic decision property, not a sorted array." },
  { title: "Search 2D Matrix", tier: "CORE", insight: "Treat as a flattened 1D array, binary search over m*n. Cannot be used for Matrix II - be able to state why." },
  { title: "Search 2D Matrix II", tier: "CORE", insight: "Staircase from top-right in O(m+n). Candidates conflate this with the flatten trick - know why Matrix II can't flatten." },
  { title: "Find Minimum in Rotated Sorted Array", tier: "SUPPORT", insight: "Compare mid to high, not to low. Compare-to-low breaks on some inputs. Know why." },
  { title: "Book Allocation Problem", tier: "SUPPORT", insight: "The min-max framing of binary-search-on-answer. Say out loud which framing it is." },
  { title: "Aggressive Cows", tier: "SUPPORT", insight: "The max-min framing of binary-search-on-answer. Say out loud which framing it is." },

  // ─── 11. Heap / Priority Queue ───
  { title: "Kth Largest Element in an Array", tier: "CORE", insight: "Min-heap of size k - evict the smallest when size exceeds k. O(n log k); know QuickSelect as the O(n) average alternative. The 'why min-heap for largest' inversion trips people up - explain it." },
  { title: "Top K Frequent Elements", tier: "CORE", insight: "Frequency map, then heap of size k. Also know the O(n) bucket-sort solution - a common follow-up." },
  { title: "Merge K Sorted Arrays", tier: "CORE", insight: "Heap holding one element per list plus its source pointer. The general k-way merge skeleton." },
  { title: "Minimum Number of Refueling Stops", tier: "CORE", insight: "Retroactive greedy: don't decide to refuel in advance; push every reachable station onto a max-heap and pop fuel only when stuck. The hardest heap idea on your list - prioritise it." },
  { title: "Reorganize String", tier: "CORE", insight: "Greedy max-heap on frequency: always place the most frequent remaining item, hold the just-used item aside one round. Same algorithm as CPU Task Scheduler." },
  { title: "CPU Task Scheduler", tier: "CORE", insight: "Greedy max-heap on frequency: place the most frequent, hold the just-used aside one round. Also has a closed-form math answer - know both." },
  { title: "K Closest Points to Origin", tier: "SUPPORT", insight: "Max-heap of size k on squared distance. Don't compute square roots - a small optimisation worth mentioning aloud." },
  { title: "Kth Smallest in Sorted Matrix (Heap)", tier: "SUPPORT", insight: "Heap solution and binary-search-on-answer solution both exist. Excellent cross-pattern rehearsal." },

  // ─── 12. Recursion & Backtracking ───
  { title: "Permutations", tier: "CORE", insight: "Know both: the boolean used[] array, and in-place swapping. State the difference in space and in how duplicates are handled." },
  { title: "Combination Sum", tier: "CORE", insight: "Reuse allowed means recurse with the SAME index, not index + 1. That single line is the difference between Combination Sum I and II." },
  { title: "Palindrome Partitioning", tier: "CORE", insight: "The partition template: for each cut point, if the prefix is valid, recurse on the suffix. Generalises to word break, IP restoration, expression splitting." },
  { title: "Generate Parentheses", tier: "SUPPORT", insight: "Prune by constraint (open < n, close < open) rather than generating everything and filtering. Constraint pruning is the core backtracking skill." },
  { title: "Letter Combinations of a Phone Number", tier: "SUPPORT", insight: "Cartesian product template. Straightforward once the recursion shape is clear." },

  // ─── 13. Bit Manipulation ───
  { title: "Single Number II", tier: "CORE", insight: "Count set bits at each of 32 positions modulo 3. Generalises to 'every element appears k times except one'. The most interview-worthy bit problem." },
  { title: "Single Number III", tier: "CORE", insight: "XOR everything, isolate the lowest set bit with x & -x, partition the array by that bit, XOR each group. The x & -x idiom is worth memorising." },
  { title: "Counting Bits", tier: "SUPPORT", insight: "dp[i] = dp[i >> 1] + (i & 1). A DP recurrence hiding in a bit problem." },
  { title: "Bitwise AND of Numbers Range", tier: "SUPPORT", insight: "The answer is the common binary prefix of low and high. Shift both right until equal, then shift back." },
  { title: "Subsets (Bitmask)", tier: "SUPPORT", insight: "Iterate 0 to 2^n - 1; bit j set means include element j. Connects directly to backtracking Subsets." },
  { title: "Single Number", tier: "SUPPORT", insight: "XOR idiom - a ^ a = 0. Recall-only." },
  { title: "Missing Number", tier: "SUPPORT", insight: "XOR of indices and values, or the sum formula. Recall-only." },
  { title: "Power of Two", tier: "SUPPORT", insight: "n > 0 && (n & (n - 1)) == 0. Recall-only." },
];
