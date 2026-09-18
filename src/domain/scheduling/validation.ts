import { z } from "zod";
import { TASK_TYPES, TASK_STATUSES, ACTIVITY_TYPES } from "./types";
import { platformSchema } from "../curriculum/validation";

export const taskTypeSchema = z.enum(TASK_TYPES);
export const taskStatusSchema = z.enum(TASK_STATUSES);
export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const dailyTaskItemSchema = z
  .object({
    taskType: taskTypeSchema,
    slotNumber: z.number().int().min(1).max(10),
    problemId: z.string().uuid("Invalid problem UUID").nullable().optional(),
    revisionId: z.string().uuid("Invalid revision UUID").nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.taskType === "new_problem" && !data.problemId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "problemId is required for new_problem tasks",
        path: ["problemId"],
      });
    }
    if (data.taskType === "revision" && !data.revisionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "revisionId is required for revision tasks",
        path: ["revisionId"],
      });
    }
  });

export const assignDailyTasksSchema = z.object({
  taskDate: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  tasks: z
    .array(dailyTaskItemSchema)
    .min(1, "At least one task must be provided")
    .max(10, "Cannot assign more than 10 tasks in a single day"),
});

export const completeTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task UUID"),
  activityDate: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  activityType: activityTypeSchema,
});

export const recordContestSchema = z.object({
  contestDate: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  contestName: z.string().trim().min(1).max(200, "Contest name too long").optional().default("LeetCode Weekly Contest"),
  platform: platformSchema.optional().default("leetcode"),
  url: z.string().url("Invalid contest URL").max(1000, "URL too long").nullable().optional(),
  participated: z.boolean().optional().default(true),
});
