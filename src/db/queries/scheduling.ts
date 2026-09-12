import { eq, and, asc, desc, gte, lte } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  dailyTasks,
  dailyActivity,
  contestParticipations,
  problems,
  revisions,
  DailyTask,
  DailyActivity,
  ContestParticipation,
  Problem,
  Revision,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export interface DailyTaskWithDetails extends DailyTask {
  problem: Problem | null;
  revision: (Revision & { problem: Problem }) | null;
}

export async function getDailyTasks(
  userId: string,
  taskDate: string,
  client: DbOrTx = defaultDb
): Promise<DailyTask[]> {
  try {
    return await client
      .select()
      .from(dailyTasks)
      .where(
        and(
          eq(dailyTasks.userId, userId),
          eq(dailyTasks.taskDate, taskDate)
        )
      )
      .orderBy(asc(dailyTasks.slotNumber));
  } catch (error) {
    handleDatabaseError(
      error,
      `getDailyTasks(user: ${userId}, date: ${taskDate}) query`
    );
  }
}

export async function getDailyTaskById(
  userId: string,
  taskId: string,
  client: DbOrTx = defaultDb
): Promise<DailyTask | null> {
  try {
    const result = await client
      .select()
      .from(dailyTasks)
      .where(
        and(
          eq(dailyTasks.id, taskId),
          eq(dailyTasks.userId, userId)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getDailyTaskById(${taskId}) query`);
  }
}

export async function getDailyActivity(
  userId: string,
  activityDate: string,
  client: DbOrTx = defaultDb
): Promise<DailyActivity | null> {
  try {
    const result = await client
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.activityDate, activityDate)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(
      error,
      `getDailyActivity(user: ${userId}, date: ${activityDate}) query`
    );
  }
}

export async function getDailyActivityRange(
  userId: string,
  startDate: string,
  endDate: string,
  client: DbOrTx = defaultDb
): Promise<DailyActivity[]> {
  try {
    return await client
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          gte(dailyActivity.activityDate, startDate),
          lte(dailyActivity.activityDate, endDate)
        )
      )
      .orderBy(asc(dailyActivity.activityDate));
  } catch (error) {
    handleDatabaseError(
      error,
      `getDailyActivityRange(user: ${userId}, start: ${startDate}, end: ${endDate}) query`
    );
  }
}

export async function getContestParticipations(
  userId: string,
  options: { limit?: number } = {},
  client: DbOrTx = defaultDb
): Promise<ContestParticipation[]> {
  try {
    let query = client
      .select()
      .from(contestParticipations)
      .where(eq(contestParticipations.userId, userId))
      .orderBy(desc(contestParticipations.contestDate));

    if (options.limit !== undefined) {
      query = query.limit(options.limit) as typeof query;
    }

    return await query;
  } catch (error) {
    handleDatabaseError(
      error,
      `getContestParticipations(user: ${userId}) query`
    );
  }
}

export async function getContestParticipationByDate(
  userId: string,
  contestDate: string,
  client: DbOrTx = defaultDb
): Promise<ContestParticipation | null> {
  try {
    const result = await client
      .select()
      .from(contestParticipations)
      .where(
        and(
          eq(contestParticipations.userId, userId),
          eq(contestParticipations.contestDate, contestDate)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(
      error,
      `getContestParticipationByDate(user: ${userId}, date: ${contestDate}) query`
    );
  }
}
