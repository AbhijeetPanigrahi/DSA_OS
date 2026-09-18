import { schedulingRepository } from "@/db/repositories/scheduling-repository";
import {
  assignDailyTasksSchema,
  completeTaskSchema,
  recordContestSchema,
} from "./validation";
import {
  AssignDailyTasksInput,
  CompleteTaskInput,
  RecordContestInput,
} from "./types";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { DailyTask, DailyActivity, ContestParticipation } from "@/db/schema";

export class SchedulingService {
  /**
   * Validates and persists a user's daily tasks.
   * Ensures slot numbers are unique within the day.
   */
  async assignDailyTasks(
    userId: string,
    input: AssignDailyTasksInput
  ): Promise<DailyTask[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = assignDailyTasksSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid daily tasks payload",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    // Invariant: slot numbers must be distinct
    const slotNumbers = validData.tasks.map((t) => t.slotNumber);
    if (new Set(slotNumbers).size !== slotNumbers.length) {
      throw new ValidationError(
        "Duplicate slot numbers within a daily task assignment are not allowed"
      );
    }

    return await schedulingRepository.assignDailyTasks(
      userId,
      validData.taskDate,
      validData.tasks
    );
  }

  /**
   * Completes a daily task and updates daily activity counters.
   * Enforces legal state transition: only 'pending' tasks can be completed.
   */
  async completeDailyTask(
    userId: string,
    input: CompleteTaskInput
  ): Promise<{ task: DailyTask; activity: DailyActivity }> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = completeTaskSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid complete task payload",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    // 1. Verify existence, ownership, and current state
    const existingTask = await schedulingRepository.getTaskById(
      userId,
      validData.taskId
    );
    if (!existingTask) {
      throw new NotFoundError(
        `Daily task ${validData.taskId} not found for user`
      );
    }

    if (existingTask.status !== "pending") {
      throw new ValidationError(
        `Cannot complete task ${validData.taskId} because it is already '${existingTask.status}'`
      );
    }

    // 2. Perform atomic completion & activity counter increment
    return await schedulingRepository.completeTaskAndLogActivity(
      userId,
      validData.taskId,
      validData.activityDate,
      validData.activityType
    );
  }

  /**
   * Records contest participation and increments contest activity counter.
   */
  async recordContestParticipation(
    userId: string,
    input: RecordContestInput
  ): Promise<{ participation: ContestParticipation; activity: DailyActivity }> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = recordContestSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid contest participation payload",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    return await schedulingRepository.recordContestParticipationEvent(
      userId,
      {
        userId,
        contestDate: validData.contestDate,
        contestName: validData.contestName,
        platform: validData.platform,
        url: validData.url ?? null,
        participated: validData.participated,
      },
      validData.contestDate
    );
  }

  /**
   * Retrieves all daily tasks for a user on a given date.
   */
  async getTasksForDate(
    userId: string,
    taskDate: string
  ): Promise<DailyTask[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await schedulingRepository.getTasksForDate(userId, taskDate);
  }

  /**
   * Retrieves daily activity record for a user on a given date.
   */
  async getDailyActivity(
    userId: string,
    activityDate: string
  ): Promise<DailyActivity | null> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await schedulingRepository.getDailyActivity(userId, activityDate);
  }

  /**
   * Retrieves daily activity history over a date range.
   */
  async getDailyActivityHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyActivity[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await schedulingRepository.getDailyActivityHistory(
      userId,
      startDate,
      endDate
    );
  }

  /**
   * Retrieves contest participation history for a user.
   */
  async getContestHistory(
    userId: string,
    limit?: number
  ): Promise<ContestParticipation[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await schedulingRepository.getContestHistory(userId, limit);
  }
}

export const schedulingService = new SchedulingService();
