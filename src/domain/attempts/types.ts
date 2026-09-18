import { MistakeCode } from "../curriculum/types";

export const ATTEMPT_OUTCOMES = [
  "independent",
  "hint",
  "approach",
  "solution",
  "failed",
] as const;
export type AttemptOutcome = (typeof ATTEMPT_OUTCOMES)[number];

export interface RecordAttemptInput {
  problemId: string;
  result: AttemptOutcome;
  startedAt?: Date;
  completedAt?: Date | null;
  durationSeconds?: number | null;
  initialApproach?: string | null;
  usedHint?: boolean;
  sawApproach?: boolean;
  sawSolution?: boolean;
  mistakeCodes?: MistakeCode[];
}

export interface AttemptFilterOptions {
  limit?: number;
  offset?: number;
  problemId?: string;
}
