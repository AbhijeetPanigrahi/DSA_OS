import { DbOrTx, withTransaction } from "../transaction";
import {
  getAttemptsByUserId,
  getAttemptById,
  getAttemptWithMistakes,
  getDistinctSolvedProblemCount,
  GetAttemptsOptions,
  AttemptWithMistakes,
} from "../queries/attempts";
import { insertAttempt, insertAttemptMistakes } from "../mutations/attempts";
import { NewAttempt, Attempt } from "../schema";
import { NotFoundError } from "@/lib/errors";

export class AttemptRepository {
  /**
   * Atomically records a problem attempt and associates any identified mistake categories.
   */
  async recordAttempt(
    data: NewAttempt,
    mistakeIds: string[] = [],
    existingTx?: DbOrTx
  ): Promise<AttemptWithMistakes> {
    return await withTransaction(async (tx) => {
      const attempt = await insertAttempt(data, tx);

      if (mistakeIds.length > 0) {
        // Filter empty/duplicate IDs
        const uniqueMistakeIds = Array.from(new Set(mistakeIds.filter(Boolean)));
        if (uniqueMistakeIds.length > 0) {
          await insertAttemptMistakes(attempt.id, uniqueMistakeIds, tx);
        }
      }

      const fullAttempt = await getAttemptWithMistakes(data.userId, attempt.id, tx);
      if (!fullAttempt) {
        return {
          ...attempt,
          mistakes: [],
        };
      }

      return fullAttempt;
    }, existingTx);
  }

  /**
   * Associates additional mistake categories with an existing attempt after verifying
   * user ownership of the attempt.
   */
  async addMistakesToAttempt(
    userId: string,
    attemptId: string,
    mistakeIds: string[],
    existingTx?: DbOrTx
  ): Promise<AttemptWithMistakes> {
    return await withTransaction(async (tx) => {
      // 1. Verify user ownership of the target attempt
      const attempt = await getAttemptById(userId, attemptId, tx);
      if (!attempt) {
        throw new NotFoundError(`Attempt ${attemptId} not found for user ${userId}`);
      }

      // 2. Filter empty/duplicate mistake IDs
      const uniqueMistakeIds = Array.from(new Set(mistakeIds.filter(Boolean)));
      if (uniqueMistakeIds.length > 0) {
        await insertAttemptMistakes(attempt.id, uniqueMistakeIds, tx);
      }

      // 3. Return full updated attempt with mistake details
      const fullAttempt = await getAttemptWithMistakes(userId, attempt.id, tx);
      return fullAttempt || { ...attempt, mistakes: [] };
    }, existingTx);
  }

  /**
   * Retrieves an attempt with its linked mistakes, ensuring user ownership.
   */
  async getAttempt(
    userId: string,
    attemptId: string,
    client?: DbOrTx
  ): Promise<AttemptWithMistakes | null> {
    return await getAttemptWithMistakes(userId, attemptId, client);
  }

  /**
   * Retrieves attempt history for a user.
   */
  async getUserAttempts(
    userId: string,
    options: GetAttemptsOptions = {},
    client?: DbOrTx
  ): Promise<Attempt[]> {
    return await getAttemptsByUserId(userId, options, client);
  }

  /**
   * Returns the count of distinct problems successfully solved by the user.
   */
  async getDistinctSolvedCount(
    userId: string,
    client?: DbOrTx
  ): Promise<number> {
    return await getDistinctSolvedProblemCount(userId, client);
  }
}

export const attemptRepository = new AttemptRepository();
