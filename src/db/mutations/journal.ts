import { eq, and, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  journalEntries,
  NewJournalEntry,
  JournalEntry,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function insertJournalEntry(
  data: NewJournalEntry,
  client: DbOrTx = defaultDb
): Promise<JournalEntry> {
  try {
    const result = await client
      .insert(journalEntries)
      .values(data)
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertJournalEntry mutation");
  }
}

export async function updateJournalEntry(
  userId: string,
  id: string,
  data: Partial<Omit<NewJournalEntry, "id" | "userId" | "problemId">>,
  client: DbOrTx = defaultDb
): Promise<JournalEntry | null> {
  try {
    const result = await client
      .update(journalEntries)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, userId)
        )
      )
      .returning();

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `updateJournalEntry(${id}) mutation`);
  }
}

/**
 * Upserts a Pattern Journal entry for a specific user and problem, enforcing
 * the single-canonical-journal-entry-per-user-problem invariant.
 */
export async function upsertJournalEntry(
  data: NewJournalEntry,
  client: DbOrTx = defaultDb
): Promise<JournalEntry> {
  try {
    const result = await client
      .insert(journalEntries)
      .values(data)
      .onConflictDoUpdate({
        target: [journalEntries.userId, journalEntries.problemId],
        set: {
          attemptId: data.attemptId,
          patternId: data.patternId,
          failedIdea: data.failedIdea,
          keyObservation: data.keyObservation,
          timeComplexity: data.timeComplexity,
          spaceComplexity: data.spaceComplexity,
          whatToRemember: data.whatToRemember,
          patternRecognition: data.patternRecognition,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, "upsertJournalEntry mutation");
  }
}
