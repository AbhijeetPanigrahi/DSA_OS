import { z } from "zod";
import { ATTEMPT_OUTCOMES, AttemptOutcome } from "./types";
import { mistakeCodeSchema } from "../curriculum/validation";

export const attemptOutcomeSchema = z.enum(ATTEMPT_OUTCOMES);

export const recordAttemptSchema = z
  .object({
    problemId: z.string().uuid("Invalid problem UUID"),
    result: attemptOutcomeSchema,
    startedAt: z.date().optional(),
    completedAt: z.date().nullable().optional(),
    durationSeconds: z
      .number()
      .int()
      .min(0, "Duration cannot be negative")
      .max(86400, "Duration cannot exceed 24 hours")
      .nullable()
      .optional(),
    initialApproach: z.string().trim().max(5000, "Approach text too long").nullable().optional(),
    usedHint: z.boolean().optional(),
    sawApproach: z.boolean().optional(),
    sawSolution: z.boolean().optional(),
    mistakeCodes: z.array(mistakeCodeSchema).max(10, "Cannot select more than 10 mistakes").optional(),
  })
  .superRefine((data, ctx) => {
    // Consistency check between outcome and help flags
    if (data.result === "independent") {
      if (data.usedHint) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'independent' cannot have usedHint=true",
          path: ["usedHint"],
        });
      }
      if (data.sawApproach) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'independent' cannot have sawApproach=true",
          path: ["sawApproach"],
        });
      }
      if (data.sawSolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'independent' cannot have sawSolution=true",
          path: ["sawSolution"],
        });
      }
    } else if (data.result === "hint") {
      if (data.sawApproach) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'hint' cannot have sawApproach=true",
          path: ["sawApproach"],
        });
      }
      if (data.sawSolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'hint' cannot have sawSolution=true",
          path: ["sawSolution"],
        });
      }
    } else if (data.result === "approach") {
      if (data.sawSolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Outcome 'approach' cannot have sawSolution=true",
          path: ["sawSolution"],
        });
      }
    }
  });

/**
 * Derives the canonical boolean flags for an attempt outcome if they were not explicitly provided.
 */
export function deriveAttemptFlags(
  result: AttemptOutcome,
  provided: {
    usedHint?: boolean;
    sawApproach?: boolean;
    sawSolution?: boolean;
  } = {}
) {
  if (result === "independent") {
    return {
      usedHint: false,
      sawApproach: false,
      sawSolution: false,
    };
  }
  if (result === "hint") {
    return {
      usedHint: true,
      sawApproach: false,
      sawSolution: false,
    };
  }
  if (result === "approach") {
    return {
      usedHint: provided.usedHint ?? false,
      sawApproach: true,
      sawSolution: false,
    };
  }
  if (result === "solution") {
    return {
      usedHint: provided.usedHint ?? false,
      sawApproach: provided.sawApproach ?? false,
      sawSolution: true,
    };
  }
  // Failed outcome: preserve user provided flags or default to false
  return {
    usedHint: provided.usedHint ?? false,
    sawApproach: provided.sawApproach ?? false,
    sawSolution: provided.sawSolution ?? false,
  };
}
