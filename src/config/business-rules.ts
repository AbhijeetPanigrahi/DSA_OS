/**
 * Centralized DSA OS Domain Business Rules & Constants
 * Source of Truth: docs/product/DSA_OS_BUSINESS_LOGIC.md
 */

export const REVISION_LADDER_DAYS = [1, 3, 7, 14, 30, 60] as const;

export const INITIAL_REVISION_INTERVAL_DAYS = {
  independent: 3,
  hint: 2,
  approach: 2,
  solution: 1,
  failed: 1,
} as const;

export const WEEKLY_WORKLOAD_DEFAULTS = {
  weekdayNewProblems: 2,
  weekdayRevisions: 1,
  saturdayRevisions: 3,
  sundayContestOnly: true,
} as const;

export const ANALYTICS_UNLOCK_THRESHOLD = 10; // distinct successfully solved problems

export const PATTERN_MASTERY_MIN_ATTEMPTS = 3;

export const PATTERN_SCORE_THRESHOLDS = {
  focus: 0.50,
  developing: 0.70,
  solid: 0.85,
  // >= 0.85 is Strong
} as const;

export const RECENT_ATTEMPT_EXCLUSION_DAYS = 14;

export const DEFAULT_TIMEZONE = "Asia/Kolkata";
