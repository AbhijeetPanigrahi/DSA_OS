import { z } from "zod";
import { isValidIanaTimezone } from "@/lib/dates";

export const ianaTimezoneSchema = z
  .string()
  .trim()
  .min(1, "Timezone identifier cannot be empty")
  .max(100, "Timezone identifier cannot exceed 100 characters")
  .refine((tz) => isValidIanaTimezone(tz), {
    message: "Invalid IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York', 'UTC')",
  });

export const updateUserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name cannot be empty")
    .max(100, "Display name cannot exceed 100 characters")
    .optional(),
  timezone: ianaTimezoneSchema.optional(),
});

export const updateUserSettingsSchema = z.object({
  weekdayProblemTarget: z
    .number()
    .int()
    .min(1, "Weekday problem target must be at least 1")
    .max(10, "Weekday problem target cannot exceed 10")
    .optional(),
  difficultyMode: z.enum(["adaptive", "easy", "medium", "mixed"]).optional(),
  practiceDays: z
    .array(z.number().int().min(1).max(7))
    .min(1, "At least one practice day must be selected")
    .max(7, "Cannot specify more than 7 practice days")
    .optional(),
  weekdayRevisionTarget: z
    .number()
    .int()
    .min(0, "Weekday revision target cannot be negative")
    .max(10, "Weekday revision target cannot exceed 10")
    .optional(),
  saturdayRevisionTarget: z
    .number()
    .int()
    .min(0, "Saturday revision target cannot be negative")
    .max(10, "Saturday revision target cannot exceed 10")
    .optional(),
  dailyPracticeReminderEnabled: z.boolean().optional(),
  revisionReminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
      "Invalid reminder time format (expected HH:MM or HH:MM:SS)"
    )
    .optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
});
