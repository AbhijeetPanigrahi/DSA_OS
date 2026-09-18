import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordAttemptSchema,
  deriveAttemptFlags,
  attemptService,
} from "@/domain/attempts";
import { attemptRepository } from "@/db/repositories/attempt-repository";
import * as curriculumQueries from "@/db/queries/curriculum";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

vi.mock("@/db/repositories/attempt-repository");
vi.mock("@/db/queries/curriculum");

describe("Attempts Domain", () => {
  const dummyUserId = "11111111-1111-4111-8111-111111111111";
  const dummyProblemId = "22222222-2222-4222-8222-222222222222";
  const dummyAttemptId = "33333333-3333-4333-8333-333333333333";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation & Consistency Rules", () => {
    it("should accept valid independent attempt", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "independent",
        durationSeconds: 1200,
        initialApproach: "Used two pointers from both ends",
      });

      expect(result.success).toBe(true);
    });

    it("should reject independent attempt if sawSolution is true", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "independent",
        sawSolution: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Outcome 'independent' cannot have sawSolution=true"
        );
      }
    });

    it("should reject hint attempt if sawSolution is true", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "hint",
        sawSolution: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Outcome 'hint' cannot have sawSolution=true"
        );
      }
    });

    it("should reject approach attempt if sawSolution is true", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "approach",
        sawSolution: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Outcome 'approach' cannot have sawSolution=true"
        );
      }
    });

    it("should reject invalid attempt outcome", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "invalid_outcome",
      });

      expect(result.success).toBe(false);
    });

    it("should reject negative duration", () => {
      const result = recordAttemptSchema.safeParse({
        problemId: dummyProblemId,
        result: "independent",
        durationSeconds: -5,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("deriveAttemptFlags", () => {
    it("should set all flags to false for independent", () => {
      const flags = deriveAttemptFlags("independent");
      expect(flags).toEqual({
        usedHint: false,
        sawApproach: false,
        sawSolution: false,
      });
    });

    it("should set usedHint=true for hint outcome", () => {
      const flags = deriveAttemptFlags("hint");
      expect(flags).toEqual({
        usedHint: true,
        sawApproach: false,
        sawSolution: false,
      });
    });

    it("should set sawApproach=true for approach outcome", () => {
      const flags = deriveAttemptFlags("approach", { usedHint: true });
      expect(flags).toEqual({
        usedHint: true,
        sawApproach: true,
        sawSolution: false,
      });
    });

    it("should set sawSolution=true for solution outcome", () => {
      const flags = deriveAttemptFlags("solution");
      expect(flags).toEqual({
        usedHint: false,
        sawApproach: false,
        sawSolution: true,
      });
    });

    it("should preserve flags for failed outcome", () => {
      const flags = deriveAttemptFlags("failed", {
        usedHint: true,
        sawApproach: false,
        sawSolution: false,
      });
      expect(flags).toEqual({
        usedHint: true,
        sawApproach: false,
        sawSolution: false,
      });
    });
  });

  describe("AttemptService", () => {
    it("should require userId for recording attempt", async () => {
      await expect(
        attemptService.recordAttempt("", {
          problemId: dummyProblemId,
          result: "independent",
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should record attempt and resolve mistake codes", async () => {
      vi.spyOn(curriculumQueries, "getMistakeByCode").mockResolvedValue({
        id: "mistake-id-1",
        code: "edge_case",
        name: "Edge Case",
        isActive: true,
        description: "Missed edge cases",
        createdAt: new Date(),
      });

      const mockSavedAttempt = {
        id: dummyAttemptId,
        userId: dummyUserId,
        problemId: dummyProblemId,
        startedAt: new Date(),
        completedAt: new Date(),
        durationSeconds: 900,
        result: "hint",
        initialApproach: "Binary search",
        usedHint: true,
        sawApproach: false,
        sawSolution: false,
        createdAt: new Date(),
        mistakes: [
          {
            id: "mistake-id-1",
            code: "edge_case",
            name: "Edge Case",
            isActive: true,
            description: "Missed edge cases",
            createdAt: new Date(),
          },
        ],
      };

      vi.spyOn(attemptRepository, "recordAttempt").mockResolvedValue(
        mockSavedAttempt
      );

      const result = await attemptService.recordAttempt(dummyUserId, {
        problemId: dummyProblemId,
        result: "hint",
        durationSeconds: 900,
        initialApproach: "Binary search",
        mistakeCodes: ["edge_case"],
      });

      expect(result).toEqual(mockSavedAttempt);
      expect(curriculumQueries.getMistakeByCode).toHaveBeenCalledWith(
        "edge_case"
      );
      expect(attemptRepository.recordAttempt).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: dummyUserId,
          problemId: dummyProblemId,
          result: "hint",
          usedHint: true,
          sawApproach: false,
          sawSolution: false,
        }),
        ["mistake-id-1"]
      );
    });

    it("should get attempt details and throw NotFoundError if missing", async () => {
      vi.spyOn(attemptRepository, "getAttempt").mockResolvedValue(null);

      await expect(
        attemptService.getAttemptDetails(dummyUserId, dummyAttemptId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should get distinct solved count", async () => {
      vi.spyOn(attemptRepository, "getDistinctSolvedCount").mockResolvedValue(10);

      const count = await attemptService.getDistinctSolvedCount(dummyUserId);
      expect(count).toBe(10);
      expect(attemptRepository.getDistinctSolvedCount).toHaveBeenCalledWith(
        dummyUserId
      );
    });
  });
});
