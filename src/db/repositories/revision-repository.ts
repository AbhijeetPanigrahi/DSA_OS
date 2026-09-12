import { DbOrTx, withTransaction } from "../transaction";
import {
  getRevisionsByUserId,
  getRevisionById,
  getRevisionByProblem,
  getDueRevisions,
  getRevisionAttempts,
  GetRevisionsOptions,
  DueRevisionWithProblem,
} from "../queries/revisions";
import {
  upsertRevision,
  updateRevision,
  insertRevisionAttempt,
} from "../mutations/revisions";
import { NewRevision, Revision, RevisionAttempt } from "../schema";
import { NotFoundError } from "@/lib/errors";

export interface RecordReviewParams {
  recallResult: string; // easy | partial | forgot
  userPatternAnswer?: string | null;
  userApproachAnswer?: string | null;
  previousIntervalDays?: number | null;
  newIntervalDays: number;
  nextReviewAt: Date;
  reviewedAt?: Date;
  status?: string;
}

export class RevisionRepository {
  /**
   * Schedules or updates the revision item for a problem.
   */
  async scheduleOrUpdateRevision(
    data: NewRevision,
    client?: DbOrTx
  ): Promise<Revision> {
    return await upsertRevision(data, client);
  }

  /**
   * Atomically records a revision review event:
   * 1. Inserts a new immutable `revision_attempts` historical record.
   * 2. Updates the current `revisions` state (nextReviewAt, currentIntervalDays, reviewCount, status).
   */
  async recordReviewAttempt(
    userId: string,
    revisionId: string,
    review: RecordReviewParams,
    existingTx?: DbOrTx
  ): Promise<{ revision: Revision; attempt: RevisionAttempt }> {
    return await withTransaction(async (tx) => {
      const currentRevision = await getRevisionById(userId, revisionId, tx);
      if (!currentRevision) {
        throw new NotFoundError(`Revision ${revisionId} not found for user`);
      }

      const reviewDate = review.reviewedAt || new Date();

      // 1. Insert immutable attempt history
      const attempt = await insertRevisionAttempt(
        {
          revisionId,
          userId,
          reviewedAt: reviewDate,
          recallResult: review.recallResult,
          userPatternAnswer: review.userPatternAnswer ?? null,
          userApproachAnswer: review.userApproachAnswer ?? null,
          previousIntervalDays: review.previousIntervalDays ?? currentRevision.currentIntervalDays,
          newIntervalDays: review.newIntervalDays,
          nextReviewAt: review.nextReviewAt,
        },
        tx
      );

      // 2. Update current revision schedule state
      const updatedRevision = await updateRevision(
        userId,
        revisionId,
        {
          currentIntervalDays: review.newIntervalDays,
          nextReviewAt: review.nextReviewAt,
          reviewCount: currentRevision.reviewCount + 1,
          status: review.status ?? "active",
        },
        tx
      );

      if (!updatedRevision) {
        throw new NotFoundError(`Failed to update revision ${revisionId}`);
      }

      return {
        revision: updatedRevision,
        attempt,
      };
    }, existingTx);
  }

  /**
   * Retrieves active revisions due on or before target date with problem details.
   */
  async getDueRevisionsForDate(
    userId: string,
    targetDate: Date,
    limit?: number,
    client?: DbOrTx
  ): Promise<DueRevisionWithProblem[]> {
    return await getDueRevisions(userId, targetDate, { limit }, client);
  }

  /**
   * Retrieves full revision attempt history for a specific revision item.
   */
  async getRevisionHistory(
    userId: string,
    revisionId: string,
    client?: DbOrTx
  ): Promise<RevisionAttempt[]> {
    return await getRevisionAttempts(userId, revisionId, client);
  }

  /**
   * Retrieves the current revision schedule item for a problem.
   */
  async getRevisionForProblem(
    userId: string,
    problemId: string,
    client?: DbOrTx
  ): Promise<Revision | null> {
    return await getRevisionByProblem(userId, problemId, client);
  }

  /**
   * Lists revisions for a user.
   */
  async listUserRevisions(
    userId: string,
    options: GetRevisionsOptions = {},
    client?: DbOrTx
  ): Promise<Revision[]> {
    return await getRevisionsByUserId(userId, options, client);
  }
}

export const revisionRepository = new RevisionRepository();
