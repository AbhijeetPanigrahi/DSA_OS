import { describe, it, expect, vi } from "vitest";
import { problemRepository } from "@/db/repositories/problem-repository";
import { userRepository } from "@/db/repositories/user-repository";
import { attemptRepository } from "@/db/repositories/attempt-repository";
import { journalRepository } from "@/db/repositories/journal-repository";
import { revisionRepository } from "@/db/repositories/revision-repository";
import { schedulingRepository } from "@/db/repositories/scheduling-repository";
import * as curriculumQueries from "@/db/queries/curriculum";
import * as userQueries from "@/db/queries/user";
import * as userMutations from "@/db/mutations/user";
import * as attemptQueries from "@/db/queries/attempts";
import * as attemptMutations from "@/db/mutations/attempts";
import * as journalQueries from "@/db/queries/journal";
import * as journalMutations from "@/db/mutations/journal";
import * as revisionQueries from "@/db/queries/revisions";
import * as revisionMutations from "@/db/mutations/revisions";
import * as schedulingQueries from "@/db/queries/scheduling";
import * as schedulingMutations from "@/db/mutations/scheduling";

describe("ProblemRepository", () => {
  it("resolves problem details via UUID", async () => {
    const mockProblem = { id: "11111111-1111-1111-1111-111111111111", title: "Two Sum" };
    vi.spyOn(curriculumQueries, "getProblemWithRelations").mockResolvedValue(mockProblem as any);

    const result = await problemRepository.getProblemDetails("11111111-1111-1111-1111-111111111111");
    expect(result).toEqual(mockProblem);
    expect(curriculumQueries.getProblemWithRelations).toHaveBeenCalledWith(
      "11111111-1111-1111-1111-111111111111",
      undefined
    );
  });

  it("resolves problem details via slug", async () => {
    const mockProblem = { id: "11111111-1111-1111-1111-111111111111", slug: "two-sum" };
    vi.spyOn(curriculumQueries, "getProblemBySlug").mockResolvedValue(mockProblem as any);
    vi.spyOn(curriculumQueries, "getProblemWithRelations").mockResolvedValue({ ...mockProblem, title: "Two Sum" } as any);

    const result = await problemRepository.getProblemDetails("two-sum");
    expect(result?.title).toBe("Two Sum");
    expect(curriculumQueries.getProblemBySlug).toHaveBeenCalledWith("two-sum", undefined);
  });

  it("loads the full curriculum catalog", async () => {
    vi.spyOn(curriculumQueries, "getPatterns").mockResolvedValue([{ id: "p1", name: "Two Pointers" }] as any);
    vi.spyOn(curriculumQueries, "getTopics").mockResolvedValue([{ id: "t1", name: "Arrays" }] as any);
    vi.spyOn(curriculumQueries, "getMistakes").mockResolvedValue([{ id: "m1", code: "edge_case" }] as any);
    vi.spyOn(curriculumQueries, "getActiveWeeklyCurriculum").mockResolvedValue([{ id: "w1", dayOfWeek: 1 }] as any);

    const catalog = await problemRepository.getCurriculumCatalog();
    expect(catalog.patterns).toHaveLength(1);
    expect(catalog.topics).toHaveLength(1);
    expect(catalog.mistakes).toHaveLength(1);
    expect(catalog.weeklyCurriculum).toHaveLength(1);
  });
});

describe("UserRepository", () => {
  it("retrieves combined user context (profile + settings)", async () => {
    vi.spyOn(userQueries, "getProfileById").mockResolvedValue({ id: "user-1", displayName: "Coder" } as any);
    vi.spyOn(userQueries, "getUserSettings").mockResolvedValue({ userId: "user-1", weekdayProblemTarget: 2 } as any);

    const context = await userRepository.getUserContext("user-1");
    expect(context.profile?.displayName).toBe("Coder");
    expect(context.settings?.weekdayProblemTarget).toBe(2);
  });

  it("initializes account with default settings in a single transaction", async () => {
    const mockProfile = { id: "user-new", displayName: "NewUser", timezone: "UTC" };
    const mockSettings = { userId: "user-new", weekdayProblemTarget: 2, difficultyMode: "adaptive" };

    vi.spyOn(userMutations, "upsertProfile").mockResolvedValue(mockProfile as any);
    vi.spyOn(userMutations, "upsertUserSettings").mockResolvedValue(mockSettings as any);

    const result = await userRepository.initializeUserAccount("user-new", "NewUser", "UTC", {} as any);
    expect(result.profile.displayName).toBe("NewUser");
    expect(result.settings.weekdayProblemTarget).toBe(2);
  });
});

describe("AttemptRepository", () => {
  it("records an attempt and associates mistakes atomically", async () => {
    const mockAttempt = { id: "attempt-1", userId: "user-1", problemId: "prob-1", result: "hint" };
    vi.spyOn(attemptMutations, "insertAttempt").mockResolvedValue(mockAttempt as any);
    vi.spyOn(attemptMutations, "insertAttemptMistakes").mockResolvedValue(undefined as any);
    vi.spyOn(attemptQueries, "getAttemptWithMistakes").mockResolvedValue({
      ...mockAttempt,
      mistakes: [{ id: "m1", code: "edge_case" }],
    } as any);

    const result = await attemptRepository.recordAttempt(
      mockAttempt as any,
      ["m1"],
      {} as any
    );

    expect(result.id).toBe("attempt-1");
    expect(result.mistakes).toHaveLength(1);
    expect(attemptMutations.insertAttemptMistakes).toHaveBeenCalledWith("attempt-1", ["m1"], expect.anything());
  });

  it("retrieves distinct solved count", async () => {
    vi.spyOn(attemptQueries, "getDistinctSolvedProblemCount").mockResolvedValue(10);
    const count = await attemptRepository.getDistinctSolvedCount("user-1");
    expect(count).toBe(10);
  });
});

describe("JournalRepository", () => {
  it("saves journal entry ensuring single entry per problem", async () => {
    const mockJournal = { id: "j-1", userId: "user-1", problemId: "prob-1", whatToRemember: "Use HashMap" };
    vi.spyOn(journalMutations, "upsertJournalEntry").mockResolvedValue(mockJournal as any);

    const result = await journalRepository.saveJournalEntry(mockJournal as any);
    expect(result.whatToRemember).toBe("Use HashMap");
  });

  it("retrieves journal for problem", async () => {
    vi.spyOn(journalQueries, "getJournalEntryByProblem").mockResolvedValue({ id: "j-1" } as any);
    const result = await journalRepository.getJournalForProblem("user-1", "prob-1");
    expect(result?.id).toBe("j-1");
  });
});

describe("RevisionRepository", () => {
  it("records a review attempt and updates schedule atomically", async () => {
    const mockRevision = { id: "rev-1", userId: "user-1", reviewCount: 1, currentIntervalDays: 1 };
    const mockAttempt = { id: "rev-att-1", revisionId: "rev-1", recallResult: "easy" };
    const updatedRevision = { ...mockRevision, reviewCount: 2, currentIntervalDays: 3 };

    vi.spyOn(revisionQueries, "getRevisionById").mockResolvedValue(mockRevision as any);
    vi.spyOn(revisionMutations, "insertRevisionAttempt").mockResolvedValue(mockAttempt as any);
    vi.spyOn(revisionMutations, "updateRevision").mockResolvedValue(updatedRevision as any);

    const result = await revisionRepository.recordReviewAttempt(
      "user-1",
      "rev-1",
      {
        recallResult: "easy",
        userPatternAnswer: "two-pointers",
        previousIntervalDays: 1,
        newIntervalDays: 3,
        nextReviewAt: new Date(),
        reviewedAt: new Date(),
      },
      {} as any
    );

    expect(result.attempt.recallResult).toBe("easy");
    expect(result.revision.currentIntervalDays).toBe(3);
  });
});

describe("SchedulingRepository", () => {
  it("assigns daily tasks batch", async () => {
    const mockTasks = [
      { id: "task-1", userId: "user-1", taskDate: "2026-09-13", slotNumber: 1, taskType: "new_problem" },
      { id: "task-2", userId: "user-1", taskDate: "2026-09-13", slotNumber: 2, taskType: "new_problem" },
    ];
    vi.spyOn(schedulingMutations, "insertDailyTasks").mockResolvedValue(mockTasks as any);

    const result = await schedulingRepository.assignDailyTasks(
      "user-1",
      "2026-09-13",
      [
        { taskType: "new_problem", slotNumber: 1, problemId: "p1" },
        { taskType: "new_problem", slotNumber: 2, problemId: "p2" },
      ]
    );

    expect(result).toHaveLength(2);
  });

  it("completes task and increments daily activity atomically", async () => {
    const mockTask = { id: "task-1", status: "completed" };
    const mockActivity = { userId: "user-1", activityDate: "2026-09-13", problemsSolved: 1 };

    vi.spyOn(schedulingMutations, "updateDailyTaskStatus").mockResolvedValue(mockTask as any);
    vi.spyOn(schedulingMutations, "incrementDailyActivityCounters").mockResolvedValue(mockActivity as any);

    const result = await schedulingRepository.completeTaskAndLogActivity(
      "user-1",
      "task-1",
      "2026-09-13",
      "problem",
      {} as any
    );

    expect(result.task.status).toBe("completed");
    expect(result.activity.problemsSolved).toBe(1);
    expect(schedulingMutations.incrementDailyActivityCounters).toHaveBeenCalledWith(
      "user-1",
      "2026-09-13",
      { problemsSolved: 1, revisionsCompleted: 0, contestParticipated: false },
      expect.anything()
    );
  });
});
