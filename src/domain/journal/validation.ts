import { z } from "zod";
import { PATTERN_RECOGNITIONS } from "./types";

export const patternRecognitionSchema = z.enum(PATTERN_RECOGNITIONS);

export const saveJournalSchema = z.object({
  problemId: z.string().uuid("Invalid problem UUID"),
  attemptId: z.string().uuid("Invalid attempt UUID").nullable().optional(),
  patternId: z.string().uuid("Invalid pattern UUID").nullable().optional(),
  failedIdea: z.string().trim().max(5000, "Failed idea text too long").nullable().optional(),
  keyObservation: z.string().trim().max(5000, "Key observation text too long").nullable().optional(),
  timeComplexity: z.string().trim().max(100, "Time complexity string too long").nullable().optional(),
  spaceComplexity: z.string().trim().max(100, "Space complexity string too long").nullable().optional(),
  whatToRemember: z
    .string()
    .trim()
    .min(1, "What to remember must not be empty")
    .max(5000, "What to remember text too long"),
  patternRecognition: patternRecognitionSchema.nullable().optional(),
});
