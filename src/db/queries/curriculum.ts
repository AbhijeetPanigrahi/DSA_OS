import { eq, and, asc } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  problems,
  patterns,
  topics,
  mistakes,
  weeklyCurriculum,
  Problem,
  Pattern,
  Topic,
  Mistake,
  WeeklyCurriculum,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export interface GetProblemsOptions {
  difficulty?: string;
  platform?: string;
  isActive?: boolean;
}

export async function getProblems(
  options: GetProblemsOptions = {},
  client: DbOrTx = defaultDb
): Promise<Problem[]> {
  try {
    const conditions = [];

    if (options.difficulty) {
      conditions.push(eq(problems.difficulty, options.difficulty));
    }
    if (options.platform) {
      conditions.push(eq(problems.platform, options.platform));
    }
    if (options.isActive !== undefined) {
      conditions.push(eq(problems.isActive, options.isActive));
    }

    if (conditions.length > 0) {
      return await client
        .select()
        .from(problems)
        .where(and(...conditions))
        .orderBy(asc(problems.title));
    }

    return await client.select().from(problems).orderBy(asc(problems.title));
  } catch (error) {
    handleDatabaseError(error, "getProblems query");
  }
}

export async function getProblemById(
  id: string,
  client: DbOrTx = defaultDb
): Promise<Problem | null> {
  try {
    const result = await client
      .select()
      .from(problems)
      .where(eq(problems.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getProblemById(${id}) query`);
  }
}

export async function getProblemBySlug(
  slug: string,
  client: DbOrTx = defaultDb
): Promise<Problem | null> {
  try {
    const result = await client
      .select()
      .from(problems)
      .where(eq(problems.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getProblemBySlug(${slug}) query`);
  }
}

export async function getProblemWithRelations(
  id: string,
  client: DbOrTx = defaultDb
) {
  try {
    const problem = await client.query.problems.findFirst({
      where: eq(problems.id, id),
      with: {
        problemPatterns: {
          with: {
            pattern: true,
          },
        },
        problemTopics: {
          with: {
            topic: true,
          },
        },
      },
    });

    if (!problem) {
      return null;
    }

    const primaryPatternRelation = problem.problemPatterns.find((p) => p.isPrimary);
    const primaryPattern = primaryPatternRelation ? primaryPatternRelation.pattern : null;
    const allPatterns = problem.problemPatterns.map((p) => p.pattern);
    const allTopics = problem.problemTopics.map((t) => t.topic);

    return {
      ...problem,
      primaryPattern,
      patterns: allPatterns,
      topics: allTopics,
    };
  } catch (error) {
    handleDatabaseError(error, `getProblemWithRelations(${id}) query`);
  }
}

export async function getPatterns(
  options: { isActive?: boolean } = {},
  client: DbOrTx = defaultDb
): Promise<Pattern[]> {
  try {
    if (options.isActive !== undefined) {
      return await client
        .select()
        .from(patterns)
        .where(eq(patterns.isActive, options.isActive))
        .orderBy(asc(patterns.name));
    }
    return await client.select().from(patterns).orderBy(asc(patterns.name));
  } catch (error) {
    handleDatabaseError(error, "getPatterns query");
  }
}

export async function getPatternById(
  id: string,
  client: DbOrTx = defaultDb
): Promise<Pattern | null> {
  try {
    const result = await client
      .select()
      .from(patterns)
      .where(eq(patterns.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getPatternById(${id}) query`);
  }
}

export async function getPatternBySlug(
  slug: string,
  client: DbOrTx = defaultDb
): Promise<Pattern | null> {
  try {
    const result = await client
      .select()
      .from(patterns)
      .where(eq(patterns.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getPatternBySlug(${slug}) query`);
  }
}

export async function getTopics(
  options: { isActive?: boolean } = {},
  client: DbOrTx = defaultDb
): Promise<Topic[]> {
  try {
    if (options.isActive !== undefined) {
      return await client
        .select()
        .from(topics)
        .where(eq(topics.isActive, options.isActive))
        .orderBy(asc(topics.name));
    }
    return await client.select().from(topics).orderBy(asc(topics.name));
  } catch (error) {
    handleDatabaseError(error, "getTopics query");
  }
}

export async function getTopicById(
  id: string,
  client: DbOrTx = defaultDb
): Promise<Topic | null> {
  try {
    const result = await client
      .select()
      .from(topics)
      .where(eq(topics.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getTopicById(${id}) query`);
  }
}

export async function getMistakes(
  options: { isActive?: boolean } = {},
  client: DbOrTx = defaultDb
): Promise<Mistake[]> {
  try {
    if (options.isActive !== undefined) {
      return await client
        .select()
        .from(mistakes)
        .where(eq(mistakes.isActive, options.isActive))
        .orderBy(asc(mistakes.name));
    }
    return await client.select().from(mistakes).orderBy(asc(mistakes.name));
  } catch (error) {
    handleDatabaseError(error, "getMistakes query");
  }
}

export async function getMistakeByCode(
  code: string,
  client: DbOrTx = defaultDb
): Promise<Mistake | null> {
  try {
    const result = await client
      .select()
      .from(mistakes)
      .where(eq(mistakes.code, code))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getMistakeByCode(${code}) query`);
  }
}

export async function getActiveWeeklyCurriculum(
  client: DbOrTx = defaultDb
): Promise<WeeklyCurriculum[]> {
  try {
    return await client
      .select()
      .from(weeklyCurriculum)
      .where(eq(weeklyCurriculum.isActive, true))
      .orderBy(asc(weeklyCurriculum.dayOfWeek));
  } catch (error) {
    handleDatabaseError(error, "getActiveWeeklyCurriculum query");
  }
}

export async function getWeeklyCurriculumByDay(
  dayOfWeek: number,
  client: DbOrTx = defaultDb
): Promise<WeeklyCurriculum | null> {
  try {
    const result = await client
      .select()
      .from(weeklyCurriculum)
      .where(and(eq(weeklyCurriculum.dayOfWeek, dayOfWeek), eq(weeklyCurriculum.isActive, true)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getWeeklyCurriculumByDay(${dayOfWeek}) query`);
  }
}
