export const PATTERN_RECOGNITIONS = [
  "independent",
  "after_hint",
  "not_recognized",
] as const;
export type PatternRecognition = (typeof PATTERN_RECOGNITIONS)[number];

export interface SaveJournalInput {
  problemId: string;
  attemptId?: string | null;
  patternId?: string | null;
  failedIdea?: string | null;
  keyObservation?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  whatToRemember: string;
  patternRecognition?: PatternRecognition | null;
}

export interface JournalFilterOptions {
  limit?: number;
  offset?: number;
  patternId?: string;
}
