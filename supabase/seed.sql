-- DSA OS — Seed Data for Canonical Patterns, Topics, and Mistakes

-- 1. Canonical Patterns
INSERT INTO patterns (name, slug, description) VALUES
('Hash Map', 'hash-map', 'Fast O(1) frequency counting, mapping, and key-value lookups.'),
('Two Pointers', 'two-pointers', 'Traversing array/string from left/right bounds or slow/fast pointers.'),
('Sliding Window', 'sliding-window', 'Maintaining subsegment window bounds over linear structures.'),
('Prefix Sum', 'prefix-sum', 'Precomputed cumulative sums for range sum queries in O(1).'),
('Binary Search', 'binary-search', 'Logarithmic search space reduction over sorted arrays or monotonic functions.'),
('Fast & Slow Pointers', 'fast-slow-pointers', 'Floyd cycle detection algorithm for linked lists and arrays.'),
('Recursion', 'recursion', 'Solving subproblems recursively with base cases.'),
('DFS', 'dfs', 'Depth-First Search for tree, graph, and matrix traversal.'),
('BFS', 'bfs', 'Breadth-First Search for shortest paths and level-order traversal.'),
('Greedy', 'greedy', 'Locally optimal choices aiming for global optimum.'),
('Backtracking', 'backtracking', 'Exhaustive state space search with pruning.'),
('Dynamic Programming', 'dynamic-programming', 'Overlapping subproblems solved via memoization or tabular bottom-up state transitions.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Canonical Topics
INSERT INTO topics (name, slug) VALUES
('Arrays', 'arrays'),
('Strings', 'strings'),
('Linked Lists', 'linked-lists'),
('Trees', 'trees'),
('Graphs', 'graphs'),
('Heaps & Priority Queues', 'heaps'),
('Stacks & Queues', 'stacks-queues'),
('Matrix', 'matrix'),
('Bit Manipulation', 'bit-manipulation')
ON CONFLICT (slug) DO NOTHING;

-- 3. Canonical Mistake Categories
INSERT INTO mistakes (code, name, description) VALUES
('problem_understanding', 'Problem Understanding', 'Misread constraints, inputs, or expected output edge conditions.'),
('finding_approach', 'Finding Approach', 'Struggled to identify the core algorithm or reduction to a known problem.'),
('pattern_recognition', 'Pattern Recognition', 'Failed to recognize the underlying canonical DSA pattern.'),
('optimization', 'Optimization', 'Brute force worked, but struggled to optimize time/space complexity.'),
('implementation', 'Implementation', 'Correct algorithm idea, but made syntax, pointer, or off-by-one coding errors.'),
('edge_case', 'Edge Case', 'Missed boundary cases such as empty inputs, single element, negative numbers, or integer overflow.'),
('time_management', 'Time Management', 'Spent too long on dead ends or took excessive time to implement.'),
('complexity', 'Complexity Analysis', 'Miscalculated upper bound time or auxiliary space complexity.')
ON CONFLICT (code) DO NOTHING;
