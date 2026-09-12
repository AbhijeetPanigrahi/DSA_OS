import { describe, it, expect, vi } from "vitest";
import * as curriculumQueries from "@/db/queries/curriculum";
import * as userQueries from "@/db/queries/user";
import * as attemptQueries from "@/db/queries/attempts";
import * as journalQueries from "@/db/queries/journal";
import * as revisionQueries from "@/db/queries/revisions";
import * as schedulingQueries from "@/db/queries/scheduling";
import * as curriculumMutations from "@/db/mutations/curriculum";
import * as userMutations from "@/db/mutations/user";
import * as attemptMutations from "@/db/mutations/attempts";
import * as journalMutations from "@/db/mutations/journal";
import * as revisionMutations from "@/db/mutations/revisions";
import * as schedulingMutations from "@/db/mutations/scheduling";

describe("Curriculum Queries & Mutations", () => {
  it("executes getProblems with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([{ id: "p1", title: "Two Sum" }]),
    } as any;

    const problems = await curriculumQueries.getProblems({}, mockClient);
    expect(problems).toHaveLength(1);
    expect(problems[0].title).toBe("Two Sum");
  });

  it("executes insertProblem with mock client", async () => {
    const mockClient = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "p1", title: "Two Sum" }]),
    } as any;

    const newProblem = await curriculumMutations.insertProblem(
      { title: "Two Sum", slug: "two-sum", platform: "leetcode", url: "https://leetcode.com", difficulty: "easy" } as any,
      mockClient
    );
    expect(newProblem.id).toBe("p1");
  });
});

describe("User Queries & Mutations", () => {
  it("executes getProfileById and getUserSettings with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "u1", displayName: "Coder" }]),
    } as any;

    const profile = await userQueries.getProfileById("u1", mockClient);
    expect(profile?.displayName).toBe("Coder");
  });

  it("executes updateUserSettings with mock client", async () => {
    const mockClient = {
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ userId: "u1", weekdayProblemTarget: 3 }]),
    } as any;

    const updated = await userMutations.updateUserSettings("u1", { weekdayProblemTarget: 3 }, mockClient);
    expect(updated?.weekdayProblemTarget).toBe(3);
  });
});

describe("Attempt Queries & Mutations", () => {
  it("executes getAttemptsByUserId with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([{ id: "a1", userId: "u1", result: "independent" }]),
    } as any;

    const attempts = await attemptQueries.getAttemptsByUserId("u1", {}, mockClient);
    expect(attempts).toHaveLength(1);
  });

  it("executes insertAttempt with mock client", async () => {
    const mockClient = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "a1", userId: "u1" }]),
    } as any;

    const attempt = await attemptMutations.insertAttempt(
      { userId: "u1", problemId: "p1", result: "independent", startedAt: new Date() } as any,
      mockClient
    );
    expect(attempt.id).toBe("a1");
  });
});

describe("Journal Queries & Mutations", () => {
  it("executes getJournalEntryByProblem with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: "j1", problemId: "p1" }]),
    } as any;

    const journal = await journalQueries.getJournalEntryByProblem("u1", "p1", mockClient);
    expect(journal?.id).toBe("j1");
  });

  it("executes upsertJournalEntry with mock client", async () => {
    const mockClient = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "j1", whatToRemember: "HashMap keys" }]),
    } as any;

    const journal = await journalMutations.upsertJournalEntry(
      { userId: "u1", problemId: "p1", whatToRemember: "HashMap keys" } as any,
      mockClient
    );
    expect(journal.whatToRemember).toBe("HashMap keys");
  });
});

describe("Revision Queries & Mutations", () => {
  it("executes getRevisionsByUserId with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([{ id: "r1", userId: "u1", status: "active" }]),
    } as any;

    const revisions = await revisionQueries.getRevisionsByUserId("u1", {}, mockClient);
    expect(revisions).toHaveLength(1);
  });

  it("executes insertRevisionAttempt with mock client", async () => {
    const mockClient = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: "ra1", recallResult: "easy" }]),
    } as any;

    const attempt = await revisionMutations.insertRevisionAttempt(
      { revisionId: "r1", userId: "u1", recallResult: "easy" } as any,
      mockClient
    );
    expect(attempt.recallResult).toBe("easy");
  });
});

describe("Scheduling Queries & Mutations", () => {
  it("executes getDailyTasks with mock client", async () => {
    const mockClient = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([{ id: "t1", slotNumber: 1 }]),
    } as any;

    const tasks = await schedulingQueries.getDailyTasks("u1", "2026-09-13", mockClient);
    expect(tasks).toHaveLength(1);
  });

  it("executes incrementDailyActivityCounters with mock client", async () => {
    const mockClient = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ userId: "u1", activityDate: "2026-09-13", problemsSolved: 1 }]),
    } as any;

    const activity = await schedulingMutations.incrementDailyActivityCounters(
      "u1",
      "2026-09-13",
      { problemsSolved: 1 },
      mockClient
    );
    expect(activity.problemsSolved).toBe(1);
  });
});
