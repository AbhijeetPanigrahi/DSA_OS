import { z } from "zod";
import { RECALL_RESULTS, REVISION_STATUSES } from "./types";

export const recallResultSchema = z.enum(RECALL_RESULTS);
export const revisionStatusSchema = z.enum(REVISION_STATUSES);

export const recordReviewSchema = z.object({
  recallResult: recallResultSchema,
  userPatternAnswer: z.string().trim().max(2000, "Pattern answer too long").nullable().optional(),
  userApproachAnswer: z.string().trim().max(5000, "Approach answer too long").nullable().optional(),
  previousIntervalDays: z.number().int().min(0).max(3650).nullable().optional(),
  newIntervalDays: z.number().int().min(0).max(3650),
  nextReviewAt: z.coerce.date(),
  reviewedAt: z.coerce.date().optional(),
  status: revisionStatusSchema.optional(),
});

export const initialRevisionScheduleSchema = z.object({
  problemId: z.string().uuid("Invalid problem UUID"),
  nextReviewAt: z.coerce.date(),
  currentIntervalDays: z.number().int().min(0).max(3650).optional().default(1),
  reviewCount: z.number().int().min(0).max(1000).optional().default(0),
  status: revisionStatusSchema.optional().default("active"),
});
