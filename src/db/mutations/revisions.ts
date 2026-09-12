import { eq, and, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  revisions,
  revisionAttempts,
  NewRevision,
  NewRevisionAttempt,
  Revision,
  RevisionAttempt,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function insertRevision(
  data: NewRevision,
  client: DbOrTx = defaultDb
): Promise<Revision> {
  try {
    const result = await client.insert(revisions).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertRevision mutation");
  }
}

export async function updateRevision(
  userId: string,
  id: string,
  data: Partial<Omit<NewRevision, "id" | "userId" | "problemId">>,
  client: DbOrTx = defaultDb
): Promise<Revision | null> {
  try {
    const result = await client
      .update(revisions)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(revisions.id, id),
          eq(revisions.userId, userId)
        )
      )
      .returning();

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `updateRevision(${id}) mutation`);
  }
}

export async function upsertRevision(
  data: NewRevision,
  client: DbOrTx = defaultDb
): Promise<Revision> {
  try {
    const result = await client
      .insert(revisions)
      .values(data)
      .onConflictDoUpdate({
        target: [revisions.userId, revisions.problemId],
        set: {
          journalEntryId: data.journalEntryId,
          nextReviewAt: data.nextReviewAt,
          currentIntervalDays: data.currentIntervalDays,
          reviewCount: data.reviewCount,
          status: data.status,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "upsertRevision mutation");
  }
}

export async function insertRevisionAttempt(
  data: NewRevisionAttempt,
  client: DbOrTx = defaultDb
): Promise<RevisionAttempt> {
  try {
    const result = await client
      .insert(revisionAttempts)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertRevisionAttempt mutation");
  }
}
