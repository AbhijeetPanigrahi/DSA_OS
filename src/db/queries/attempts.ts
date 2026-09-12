import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import { attempts, attemptMistakes, mistakes, Attempt, Mistake } from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export interface GetAttemptsOptions {
  limit?: number;
  offset?: number;
  problemId?: string;
}

export async function getAttemptsByUserId(
  userId: string,
  options: GetAttemptsOptions = {},
  client: DbOrTx = defaultDb
): Promise<Attempt[]> {
  try {
    const conditions = [eq(attempts.userId, userId)];

    if (options.problemId) {
      conditions.push(eq(attempts.problemId, options.problemId));
    }

    let query = client
      .select()
      .from(attempts)
      .where(and(...conditions))
      .orderBy(desc(attempts.startedAt));

    if (options.limit !== undefined && options.limit > 0) {
      const safeLimit = Math.min(options.limit, 100);
      query = query.limit(safeLimit) as typeof query;
    }
    if (options.offset !== undefined && options.offset >= 0) {
      query = query.offset(options.offset) as typeof query;
    }

    return await query;
  } catch (error) {
    handleDatabaseError(error, `getAttemptsByUserId(${userId}) query`);
  }
}

export async function getAttemptById(
  userId: string,
  attemptId: string,
  client: DbOrTx = defaultDb
): Promise<Attempt | null> {
  try {
    const result = await client
      .select()
      .from(attempts)
      .where(and(eq(attempts.id, attemptId), eq(attempts.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getAttemptById(${attemptId}) query`);
  }
}

export interface AttemptWithMistakes extends Attempt {
  mistakes: Mistake[];
}

export async function getAttemptWithMistakes(
  userId: string,
  attemptId: string,
  client: DbOrTx = defaultDb
): Promise<AttemptWithMistakes | null> {
  try {
    const attempt = await getAttemptById(userId, attemptId, client);
    if (!attempt) {
      return null;
    }

    const mistakeRows = await client
      .select({ mistake: mistakes })
      .from(attemptMistakes)
      .innerJoin(mistakes, eq(attemptMistakes.mistakeId, mistakes.id))
      .where(eq(attemptMistakes.attemptId, attemptId));

    return {
      ...attempt,
      mistakes: mistakeRows.map((r) => r.mistake),
    };
  } catch (error) {
    handleDatabaseError(error, `getAttemptWithMistakes(${attemptId}) query`);
  }
}

/**
 * Counts the distinct number of problems solved successfully by the user
 * (used for checking the 10-problem analytics unlock threshold).
 * Solved results: 'independent', 'hint', 'approach', 'solution' (i.e. not 'failed').
 */
export async function getDistinctSolvedProblemCount(
  userId: string,
  client: DbOrTx = defaultDb
): Promise<number> {
  try {
    const successfulResults = ["independent", "hint", "approach", "solution"];

    const result = await client
      .select({
        count: sql<number>`count(distinct ${attempts.problemId})::int`,
      })
      .from(attempts)
      .where(
        and(
          eq(attempts.userId, userId),
          inArray(attempts.result, successfulResults)
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    handleDatabaseError(error, `getDistinctSolvedProblemCount(${userId}) query`);
  }
}
