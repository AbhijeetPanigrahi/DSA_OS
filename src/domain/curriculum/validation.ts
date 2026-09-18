import { z } from "zod";
import { DIFFICULTIES, PLATFORMS, MISTAKE_CODES } from "./types";

export const difficultySchema = z.enum(DIFFICULTIES);
export const platformSchema = z.enum(PLATFORMS);
export const mistakeCodeSchema = z.enum(MISTAKE_CODES);

export const problemFilterSchema = z.object({
  difficulty: difficultySchema.optional(),
  platform: platformSchema.optional(),
  isActive: z.boolean().optional(),
});
