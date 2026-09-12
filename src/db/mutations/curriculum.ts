import { eq } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  problems,
  patterns,
  topics,
  mistakes,
  problemPatterns,
  problemTopics,
  NewProblem,
  NewPattern,
  NewTopic,
  NewMistake,
  Problem,
  Pattern,
  Topic,
  Mistake,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function insertProblem(
  data: NewProblem,
  client: DbOrTx = defaultDb
): Promise<Problem> {
  try {
    const result = await client.insert(problems).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertProblem mutation");
  }
}

export async function insertPattern(
  data: NewPattern,
  client: DbOrTx = defaultDb
): Promise<Pattern> {
  try {
    const result = await client.insert(patterns).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertPattern mutation");
  }
}

export async function insertTopic(
  data: NewTopic,
  client: DbOrTx = defaultDb
): Promise<Topic> {
  try {
    const result = await client.insert(topics).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertTopic mutation");
  }
}

export async function insertMistake(
  data: NewMistake,
  client: DbOrTx = defaultDb
): Promise<Mistake> {
  try {
    const result = await client.insert(mistakes).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertMistake mutation");
  }
}

export async function linkProblemPattern(
  problemId: string,
  patternId: string,
  isPrimary = false,
  client: DbOrTx = defaultDb
): Promise<void> {
  try {
    await client
      .insert(problemPatterns)
      .values({ problemId, patternId, isPrimary })
      .onConflictDoNothing();
  } catch (error) {
    handleDatabaseError(error, "linkProblemPattern mutation");
  }
}

export async function linkProblemTopic(
  problemId: string,
  topicId: string,
  client: DbOrTx = defaultDb
): Promise<void> {
  try {
    await client
      .insert(problemTopics)
      .values({ problemId, topicId })
      .onConflictDoNothing();
  } catch (error) {
    handleDatabaseError(error, "linkProblemTopic mutation");
  }
}
