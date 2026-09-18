export const RECALL_RESULTS = ["easy", "partial", "forgot"] as const;
export type RecallResult = (typeof RECALL_RESULTS)[number];

export const REVISION_STATUSES = ["active", "paused"] as const;
export type RevisionStatus = (typeof REVISION_STATUSES)[number];

export interface RecordReviewInput {
  recallResult: RecallResult;
  userPatternAnswer?: string | null;
  userApproachAnswer?: string | null;
  previousIntervalDays?: number | null;
  newIntervalDays: number;
  nextReviewAt: Date;
  reviewedAt?: Date;
  status?: RevisionStatus;
}

export interface InitialRevisionScheduleInput {
  problemId: string;
  nextReviewAt: Date;
  currentIntervalDays?: number;
  reviewCount?: number;
  status?: RevisionStatus;
}

export interface RevisionFilterOptions {
  status?: RevisionStatus;
  limit?: number;
  offset?: number;
}
