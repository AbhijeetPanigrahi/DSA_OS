import { eq, and, lte, desc, asc } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  revisions,
  revisionAttempts,
  problems,
  Revision,
  RevisionAttempt,
  Problem,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export interface GetRevisionsOptions {
  status?: string;
  limit?: number;
}

export async function getRevisionsByUserId(
  userId: string,
  options: GetRevisionsOptions = {},
  client: DbOrTx = defaultDb
): Promise<Revision[]> {
  try {
    const conditions = [eq(revisions.userId, userId)];

    if (options.status) {
      conditions.push(eq(revisions.status, options.status));
    }

    let query = client
      .select()
      .from(revisions)
      .where(and(...conditions))
      .orderBy(asc(revisions.nextReviewAt));

    if (options.limit !== undefined) {
      query = query.limit(options.limit) as typeof query;
    }

    return await query;
  } catch (error) {
    handleDatabaseError(error, `getRevisionsByUserId(${userId}) query`);
  }
}

export async function getRevisionById(
  userId: string,
  id: string,
  client: DbOrTx = defaultDb
): Promise<Revision | null> {
  try {
    const result = await client
      .select()
      .from(revisions)
      .where(and(eq(revisions.id, id), eq(revisions.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getRevisionById(${id}) query`);
  }
}

export async function getRevisionByProblem(
  userId: string,
  problemId: string,
  client: DbOrTx = defaultDb
): Promise<Revision | null> {
  try {
    const result = await client
      .select()
      .from(revisions)
      .where(
        and(
          eq(revisions.userId, userId),
          eq(revisions.problemId, problemId)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(
      error,
      `getRevisionByProblem(user: ${userId}, problem: ${problemId}) query`
    );
  }
}

export interface DueRevisionWithProblem extends Revision {
  problem: Problem;
}

/**
 * Retrieves active revisions for a user that are due on or before the given target date/time.
 */
export async function getDueRevisions(
  userId: string,
  dueBefore: Date,
  options: { limit?: number } = {},
  client: DbOrTx = defaultDb
): Promise<DueRevisionWithProblem[]> {
  try {
    let query = client
      .select({
        revision: revisions,
        problem: problems,
      })
      .from(revisions)
      .innerJoin(problems, eq(revisions.problemId, problems.id))
      .where(
        and(
          eq(revisions.userId, userId),
          eq(revisions.status, "active"),
          lte(revisions.nextReviewAt, dueBefore)
        )
      )
      .orderBy(asc(revisions.nextReviewAt));

    if (options.limit !== undefined) {
      query = query.limit(options.limit) as typeof query;
    }

    const rows = await query;
    return rows.map((r) => ({
      ...r.revision,
      problem: r.problem,
    }));
  } catch (error) {
    handleDatabaseError(error, `getDueRevisions(user: ${userId}, date: ${dueBefore}) query`);
  }
}

export async function getRevisionAttempts(
  userId: string,
  revisionId: string,
  client: DbOrTx = defaultDb
): Promise<RevisionAttempt[]> {
  try {
    return await client
      .select()
      .from(revisionAttempts)
      .where(
        and(
          eq(revisionAttempts.revisionId, revisionId),
          eq(revisionAttempts.userId, userId)
        )
      )
      .orderBy(desc(revisionAttempts.reviewedAt));
  } catch (error) {
    handleDatabaseError(
      error,
      `getRevisionAttempts(user: ${userId}, revision: ${revisionId}) query`
    );
  }
}
