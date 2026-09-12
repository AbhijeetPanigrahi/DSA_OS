import { DbOrTx, withTransaction } from "../transaction";
import {
  getDailyTasks,
  getDailyTaskById,
  getDailyActivity,
  getDailyActivityRange,
  getContestParticipations,
  getContestParticipationByDate,
} from "../queries/scheduling";
import {
  insertDailyTasks,
  updateDailyTaskStatus,
  incrementDailyActivityCounters,
  insertContestParticipation,
} from "../mutations/scheduling";
import {
  NewDailyTask,
  NewContestParticipation,
  DailyTask,
  DailyActivity,
  ContestParticipation,
} from "../schema";
import { NotFoundError } from "@/lib/errors";

export class SchedulingRepository {
  /**
   * Persists daily tasks for a user and date.
   */
  async assignDailyTasks(
    userId: string,
    taskDate: string,
    tasks: Array<{
      taskType: "new_problem" | "revision" | "contest";
      slotNumber: number;
      problemId?: string | null;
      revisionId?: string | null;
    }>,
    client?: DbOrTx
  ): Promise<DailyTask[]> {
    const records: NewDailyTask[] = tasks.map((t) => ({
      userId,
      taskDate,
      taskType: t.taskType,
      slotNumber: t.slotNumber,
      problemId: t.problemId ?? null,
      revisionId: t.revisionId ?? null,
      status: "pending",
    }));

    return await insertDailyTasks(records, client);
  }

  /**
   * Retrieves all daily tasks for a specific user and local date.
   */
  async getTasksForDate(
    userId: string,
    taskDate: string,
    client?: DbOrTx
  ): Promise<DailyTask[]> {
    return await getDailyTasks(userId, taskDate, client);
  }

  /**
   * Atomically completes a daily task and increments the user's daily activity counter.
   */
  async completeTaskAndLogActivity(
    userId: string,
    taskId: string,
    activityDate: string,
    activityType: "problem" | "revision" | "contest",
    existingTx?: DbOrTx
  ): Promise<{ task: DailyTask; activity: DailyActivity }> {
    return await withTransaction(async (tx) => {
      const task = await updateDailyTaskStatus(
        userId,
        taskId,
        "completed",
        new Date(),
        tx
      );

      if (!task) {
        throw new NotFoundError(`Daily task ${taskId} not found for user`);
      }

      const activity = await incrementDailyActivityCounters(
        userId,
        activityDate,
        {
          problemsSolved: activityType === "problem" ? 1 : 0,
          revisionsCompleted: activityType === "revision" ? 1 : 0,
          contestParticipated: activityType === "contest" ? true : false,
        },
        tx
      );

      return { task, activity };
    }, existingTx);
  }

  /**
   * Atomically records contest participation and marks the user's daily activity for that contest day.
   */
  async recordContestParticipationEvent(
    userId: string,
    contestData: NewContestParticipation,
    activityDate: string,
    existingTx?: DbOrTx
  ): Promise<{ participation: ContestParticipation; activity: DailyActivity }> {
    return await withTransaction(async (tx) => {
      const participation = await insertContestParticipation(contestData, tx);

      const activity = await incrementDailyActivityCounters(
        userId,
        activityDate,
        {
          contestParticipated: true,
        },
        tx
      );

      return { participation, activity };
    }, existingTx);
  }

  /**
   * Retrieves daily activity record for a specific local date.
   */
  async getDailyActivity(
    userId: string,
    activityDate: string,
    client?: DbOrTx
  ): Promise<DailyActivity | null> {
    return await getDailyActivity(userId, activityDate, client);
  }

  /**
   * Retrieves daily activity history over a date range.
   */
  async getDailyActivityHistory(
    userId: string,
    startDate: string,
    endDate: string,
    client?: DbOrTx
  ): Promise<DailyActivity[]> {
    return await getDailyActivityRange(userId, startDate, endDate, client);
  }

  /**
   * Retrieves contest participation history for a user.
   */
  async getContestHistory(
    userId: string,
    limit?: number,
    client?: DbOrTx
  ): Promise<ContestParticipation[]> {
    return await getContestParticipations(userId, { limit }, client);
  }
}

export const schedulingRepository = new SchedulingRepository();
