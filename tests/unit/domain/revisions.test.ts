import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordReviewSchema,
  initialRevisionScheduleSchema,
  revisionService,
} from "@/domain/revisions";
import { revisionRepository } from "@/db/repositories/revision-repository";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

vi.mock("@/db/repositories/revision-repository");

describe("Revisions Domain", () => {
  const dummyUserId = "11111111-1111-4111-8111-111111111111";
  const dummyProblemId = "22222222-2222-4222-8222-222222222222";
  const dummyRevisionId = "55555555-5555-4555-8555-555555555555";
  const dummyAttemptId = "66666666-6666-4666-8666-666666666666";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("should accept valid review record input", () => {
      const nextDate = new Date(Date.now() + 86400000 * 3);
      const result = recordReviewSchema.safeParse({
        recallResult: "easy",
        userPatternAnswer: "Monotonic Stack",
        userApproachAnswer: "Store indices in descending order",
        newIntervalDays: 3,
        nextReviewAt: nextDate,
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid recall result", () => {
      const result = recordReviewSchema.safeParse({
        recallResult: "perfect",
        newIntervalDays: 3,
        nextReviewAt: new Date(),
      });

      expect(result.success).toBe(false);
    });

    it("should reject negative newIntervalDays", () => {
      const result = recordReviewSchema.safeParse({
        recallResult: "easy",
        newIntervalDays: -1,
        nextReviewAt: new Date(),
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid initial revision schedule payload", () => {
      const nextDate = new Date(Date.now() + 86400000);
      const result = initialRevisionScheduleSchema.safeParse({
        problemId: dummyProblemId,
        nextReviewAt: nextDate,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentIntervalDays).toBe(1);
        expect(result.data.reviewCount).toBe(0);
        expect(result.data.status).toBe("active");
      }
    });
  });

  describe("RevisionService", () => {
    it("should require userId for recording review", async () => {
      await expect(
        revisionService.recordReview("", dummyRevisionId, {
          recallResult: "easy",
          newIntervalDays: 3,
          nextReviewAt: new Date(),
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should record review attempt successfully", async () => {
      const mockResult = {
        revision: {
          id: dummyRevisionId,
          userId: dummyUserId,
          problemId: dummyProblemId,
          journalEntryId: null,
          currentIntervalDays: 3,
          nextReviewAt: new Date(),
          reviewCount: 1,
          status: "active" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        attempt: {
          id: dummyAttemptId,
          revisionId: dummyRevisionId,
          userId: dummyUserId,
          reviewedAt: new Date(),
          recallResult: "easy" as const,
          userPatternAnswer: "Two Pointers",
          userApproachAnswer: "Left and right inward pointers",
          previousIntervalDays: 1,
          newIntervalDays: 3,
          nextReviewAt: new Date(),
          createdAt: new Date(),
        },
      };

      vi.spyOn(revisionRepository, "recordReviewAttempt").mockResolvedValue(
        mockResult
      );

      const nextReviewDate = new Date();
      const result = await revisionService.recordReview(
        dummyUserId,
        dummyRevisionId,
        {
          recallResult: "easy",
          userPatternAnswer: "Two Pointers",
          userApproachAnswer: "Left and right inward pointers",
          previousIntervalDays: 1,
          newIntervalDays: 3,
          nextReviewAt: nextReviewDate,
        }
      );

      expect(result).toEqual(mockResult);
      expect(revisionRepository.recordReviewAttempt).toHaveBeenCalledWith(
        dummyUserId,
        dummyRevisionId,
        expect.objectContaining({
          recallResult: "easy",
          newIntervalDays: 3,
          nextReviewAt: nextReviewDate,
        })
      );
    });

    it("should schedule initial revision successfully", async () => {
      const nextDate = new Date();
      const mockRevision = {
        id: dummyRevisionId,
        userId: dummyUserId,
        problemId: dummyProblemId,
        journalEntryId: null,
        currentIntervalDays: 3,
        nextReviewAt: nextDate,
        reviewCount: 0,
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(revisionRepository, "scheduleOrUpdateRevision").mockResolvedValue(
        mockRevision
      );

      const result = await revisionService.scheduleInitialRevision(
        dummyUserId,
        {
          problemId: dummyProblemId,
          nextReviewAt: nextDate,
          currentIntervalDays: 3,
        }
      );

      expect(result).toEqual(mockRevision);
      expect(revisionRepository.scheduleOrUpdateRevision).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: dummyUserId,
          problemId: dummyProblemId,
          currentIntervalDays: 3,
        })
      );
    });
  });
});
