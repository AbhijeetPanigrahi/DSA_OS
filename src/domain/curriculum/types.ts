/**
 * Canonical domain types for Curriculum: Difficulty, Platform, and Mistakes
 */

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const PLATFORMS = [
  "leetcode",
  "geeksforgeeks",
  "hackerrank",
  "codeforces",
  "codechef",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const MISTAKE_CODES = [
  "problem_understanding",
  "finding_approach",
  "pattern_recognition",
  "optimization",
  "implementation",
  "edge_case",
  "time_management",
  "complexity",
] as const;
export type MistakeCode = (typeof MISTAKE_CODES)[number];
