import { eq, and, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  dailyTasks,
  dailyActivity,
  contestParticipations,
  NewDailyTask,
  NewDailyActivity,
  NewContestParticipation,
  DailyTask,
  DailyActivity,
  ContestParticipation,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function insertDailyTasks(
  tasks: NewDailyTask[],
  client: DbOrTx = defaultDb
): Promise<DailyTask[]> {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  try {
    return await client.insert(dailyTasks).values(tasks).returning();
  } catch (error) {
    handleDatabaseError(error, "insertDailyTasks mutation");
  }
}

export async function updateDailyTaskStatus(
  userId: string,
  taskId: string,
  status: "pending" | "completed" | "skipped",
  completedAt: Date | null = status === "completed" ? new Date() : null,
  client: DbOrTx = defaultDb
): Promise<DailyTask | null> {
  try {
    const result = await client
      .update(dailyTasks)
      .set({
        status,
        completedAt,
      })
      .where(
        and(
          eq(dailyTasks.id, taskId),
          eq(dailyTasks.userId, userId)
        )
      )
      .returning();

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `updateDailyTaskStatus(${taskId}) mutation`);
  }
}

export async function upsertDailyActivity(
  data: NewDailyActivity,
  client: DbOrTx = defaultDb
): Promise<DailyActivity> {
  try {
    const result = await client
      .insert(dailyActivity)
      .values(data)
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.activityDate],
        set: {
          problemsSolved: data.problemsSolved ?? 0,
          revisionsCompleted: data.revisionsCompleted ?? 0,
          contestParticipated: data.contestParticipated ?? false,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "upsertDailyActivity mutation");
  }
}

export interface DailyActivityIncrements {
  problemsSolved?: number;
  revisionsCompleted?: number;
  contestParticipated?: boolean;
}

/**
 * Atomically increments or updates daily activity counts for a user on a given local date.
 * If no record exists for that date, creates it with the given initial values.
 */
export async function incrementDailyActivityCounters(
  userId: string,
  activityDate: string,
  increments: DailyActivityIncrements,
  client: DbOrTx = defaultDb
): Promise<DailyActivity> {
  const problemsInc = increments.problemsSolved ?? 0;
  const revisionsInc = increments.revisionsCompleted ?? 0;
  const contestVal = increments.contestParticipated ?? false;

  try {
    const result = await client
      .insert(dailyActivity)
      .values({
        userId,
        activityDate,
        problemsSolved: problemsInc,
        revisionsCompleted: revisionsInc,
        contestParticipated: contestVal,
      })
      .onConflictDoUpdate({
        target: [dailyActivity.userId, dailyActivity.activityDate],
        set: {
          problemsSolved: sql`${dailyActivity.problemsSolved} + ${problemsInc}`,
          revisionsCompleted: sql`${dailyActivity.revisionsCompleted} + ${revisionsInc}`,
          contestParticipated: contestVal
            ? true
            : dailyActivity.contestParticipated,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(
      error,
      `incrementDailyActivityCounters(user: ${userId}, date: ${activityDate}) mutation`
    );
  }
}

export async function insertContestParticipation(
  data: NewContestParticipation,
  client: DbOrTx = defaultDb
): Promise<ContestParticipation> {
  try {
    const result = await client
      .insert(contestParticipations)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertContestParticipation mutation");
  }
}
