import { eq, and, desc } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  journalEntries,
  problems,
  patterns,
  JournalEntry,
  Problem,
  Pattern,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export interface GetJournalEntriesOptions {
  limit?: number;
  offset?: number;
  patternId?: string;
}

export async function getJournalEntriesByUserId(
  userId: string,
  options: GetJournalEntriesOptions = {},
  client: DbOrTx = defaultDb
): Promise<JournalEntry[]> {
  try {
    const conditions = [eq(journalEntries.userId, userId)];

    if (options.patternId) {
      conditions.push(eq(journalEntries.patternId, options.patternId));
    }

    let query = client
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.updatedAt));

    if (options.limit !== undefined && options.limit > 0) {
      const safeLimit = Math.min(options.limit, 100);
      query = query.limit(safeLimit) as typeof query;
    }
    if (options.offset !== undefined && options.offset >= 0) {
      query = query.offset(options.offset) as typeof query;
    }

    return await query;
  } catch (error) {
    handleDatabaseError(error, `getJournalEntriesByUserId(${userId}) query`);
  }
}

export async function getJournalEntryById(
  userId: string,
  id: string,
  client: DbOrTx = defaultDb
): Promise<JournalEntry | null> {
  try {
    const result = await client
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getJournalEntryById(${id}) query`);
  }
}

export async function getJournalEntryByProblem(
  userId: string,
  problemId: string,
  client: DbOrTx = defaultDb
): Promise<JournalEntry | null> {
  try {
    const result = await client
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.problemId, problemId)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(
      error,
      `getJournalEntryByProblem(user: ${userId}, problem: ${problemId}) query`
    );
  }
}

export interface JournalEntryWithDetails extends JournalEntry {
  problem: Problem;
  pattern: Pattern | null;
}

export async function getJournalEntryWithDetails(
  userId: string,
  id: string,
  client: DbOrTx = defaultDb
): Promise<JournalEntryWithDetails | null> {
  try {
    const result = await client
      .select({
        journalEntry: journalEntries,
        problem: problems,
        pattern: patterns,
      })
      .from(journalEntries)
      .innerJoin(problems, eq(journalEntries.problemId, problems.id))
      .leftJoin(patterns, eq(journalEntries.patternId, patterns.id))
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      ...row.journalEntry,
      problem: row.problem,
      pattern: row.pattern,
    };
  } catch (error) {
    handleDatabaseError(error, `getJournalEntryWithDetails(${id}) query`);
  }
}
