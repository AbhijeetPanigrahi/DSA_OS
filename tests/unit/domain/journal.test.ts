import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveJournalSchema, journalService } from "@/domain/journal";
import { journalRepository } from "@/db/repositories/journal-repository";
import { attemptRepository } from "@/db/repositories/attempt-repository";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

vi.mock("@/db/repositories/journal-repository");
vi.mock("@/db/repositories/attempt-repository");

describe("Journal Domain", () => {
  const dummyUserId = "11111111-1111-4111-8111-111111111111";
  const dummyProblemId = "22222222-2222-4222-8222-222222222222";
  const dummyAttemptId = "33333333-3333-4333-8333-333333333333";
  const dummyJournalId = "44444444-4444-4444-8444-444444444444";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("should accept valid journal entry payload", () => {
      const result = saveJournalSchema.safeParse({
        problemId: dummyProblemId,
        whatToRemember: "Always check subarray boundary conditions",
        failedIdea: "Brute force O(n^2)",
        keyObservation: "Sliding window with monotonic queue",
        timeComplexity: "O(n)",
        spaceComplexity: "O(k)",
        patternRecognition: "independent",
      });

      expect(result.success).toBe(true);
    });

    it("should reject empty whatToRemember", () => {
      const result = saveJournalSchema.safeParse({
        problemId: dummyProblemId,
        whatToRemember: "   ",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "What to remember must not be empty"
        );
      }
    });

    it("should reject invalid problem UUID", () => {
      const result = saveJournalSchema.safeParse({
        problemId: "not-a-uuid",
        whatToRemember: "Valid note",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("JournalService", () => {
    it("should require userId for saving journal", async () => {
      await expect(
        journalService.saveJournalEntry("", {
          problemId: dummyProblemId,
          whatToRemember: "Note",
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should verify attempt ownership if attemptId is provided", async () => {
      vi.spyOn(attemptRepository, "getAttempt").mockResolvedValue(null);

      await expect(
        journalService.saveJournalEntry(dummyUserId, {
          problemId: dummyProblemId,
          attemptId: dummyAttemptId,
          whatToRemember: "Note",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject if attempt problemId does not match journal problemId", async () => {
      const mismatchProblemId = "55555555-5555-4555-8555-555555555555";
      vi.spyOn(attemptRepository, "getAttempt").mockResolvedValue({
        id: dummyAttemptId,
        userId: dummyUserId,
        problemId: mismatchProblemId,
        startedAt: new Date(),
        completedAt: new Date(),
        durationSeconds: 300,
        result: "independent",
        initialApproach: null,
        usedHint: false,
        sawApproach: false,
        sawSolution: false,
        createdAt: new Date(),
        mistakes: [],
      });

      await expect(
        journalService.saveJournalEntry(dummyUserId, {
          problemId: dummyProblemId,
          attemptId: dummyAttemptId,
          whatToRemember: "Note",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should save journal entry successfully", async () => {
      const mockSavedJournal = {
        id: dummyJournalId,
        userId: dummyUserId,
        problemId: dummyProblemId,
        attemptId: null,
        patternId: null,
        failedIdea: "None",
        keyObservation: "Hash map prefix sums",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        whatToRemember: "Prefix sums can identify target subarrays in O(1)",
        patternRecognition: "independent" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(journalRepository, "saveJournalEntry").mockResolvedValue(
        mockSavedJournal
      );

      const result = await journalService.saveJournalEntry(dummyUserId, {
        problemId: dummyProblemId,
        whatToRemember: "Prefix sums can identify target subarrays in O(1)",
        failedIdea: "None",
        keyObservation: "Hash map prefix sums",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        patternRecognition: "independent",
      });

      expect(result).toEqual(mockSavedJournal);
      expect(journalRepository.saveJournalEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: dummyUserId,
          problemId: dummyProblemId,
          whatToRemember: "Prefix sums can identify target subarrays in O(1)",
        })
      );
    });

    it("should get journal details and throw NotFoundError if missing", async () => {
      vi.spyOn(journalRepository, "getJournalDetails").mockResolvedValue(null);

      await expect(
        journalService.getJournalDetails(dummyUserId, dummyJournalId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
