import { Platform } from "../curriculum/types";

export const TASK_TYPES = ["new_problem", "revision", "contest"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = ["pending", "completed", "skipped"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const ACTIVITY_TYPES = ["problem", "revision", "contest"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface DailyTaskItemInput {
  taskType: TaskType;
  slotNumber: number;
  problemId?: string | null;
  revisionId?: string | null;
}

export interface AssignDailyTasksInput {
  taskDate: string; // YYYY-MM-DD
  tasks: DailyTaskItemInput[];
}

export interface CompleteTaskInput {
  taskId: string;
  activityDate: string; // YYYY-MM-DD
  activityType: ActivityType;
}

export interface RecordContestInput {
  contestDate: string; // YYYY-MM-DD
  contestName?: string;
  platform?: Platform;
  url?: string | null;
  participated?: boolean;
}
