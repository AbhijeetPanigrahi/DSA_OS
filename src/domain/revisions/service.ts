import { revisionRepository } from "@/db/repositories/revision-repository";
import {
  recordReviewSchema,
  initialRevisionScheduleSchema,
} from "./validation";
import {
  RecordReviewInput,
  InitialRevisionScheduleInput,
  RevisionFilterOptions,
} from "./types";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Revision, RevisionAttempt } from "@/db/schema";
import { DueRevisionWithProblem } from "@/db/queries/revisions";

export class RevisionService {
  /**
   * Records a revision review attempt and updates the revision schedule atomically.
   */
  async recordReview(
    userId: string,
    revisionId: string,
    input: RecordReviewInput
  ): Promise<{ revision: Revision; attempt: RevisionAttempt }> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = recordReviewSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid revision review data",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    return await revisionRepository.recordReviewAttempt(
      userId,
      revisionId,
      validData
    );
  }

  /**
   * Initializes or updates a problem revision schedule.
   */
  async scheduleInitialRevision(
    userId: string,
    input: InitialRevisionScheduleInput
  ): Promise<Revision> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = initialRevisionScheduleSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid revision schedule data",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    return await revisionRepository.scheduleOrUpdateRevision({
      userId,
      problemId: validData.problemId,
      nextReviewAt: validData.nextReviewAt,
      currentIntervalDays: validData.currentIntervalDays ?? 1,
      reviewCount: validData.reviewCount ?? 0,
      status: validData.status ?? "active",
    });
  }

  /**
   * Retrieves active revisions due on or before a target date with problem details.
   */
  async getDueRevisions(
    userId: string,
    targetDate: Date,
    limit?: number
  ): Promise<DueRevisionWithProblem[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await revisionRepository.getDueRevisionsForDate(
      userId,
      targetDate,
      limit
    );
  }

  /**
   * Retrieves complete review attempt history for a specific revision item.
   */
  async getRevisionHistory(
    userId: string,
    revisionId: string
  ): Promise<RevisionAttempt[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await revisionRepository.getRevisionHistory(userId, revisionId);
  }

  /**
   * Retrieves the current revision state for a given problem.
   */
  async getRevisionForProblem(
    userId: string,
    problemId: string
  ): Promise<Revision | null> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await revisionRepository.getRevisionForProblem(userId, problemId);
  }

  /**
   * Lists revisions for a user with optional status and pagination filters.
   */
  async listUserRevisions(
    userId: string,
    options: RevisionFilterOptions = {}
  ): Promise<Revision[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await revisionRepository.listUserRevisions(userId, options);
  }
}

export const revisionService = new RevisionService();
