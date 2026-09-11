import { describe, it, expect } from "vitest";
import { getTableName } from "drizzle-orm";
import {
  profiles,
  userSettings,
  problems,
  patterns,
  topics,
  problemPatterns,
  problemTopics,
  mistakes,
  weeklyCurriculum,
  attempts,
  attemptMistakes,
  journalEntries,
  revisions,
  revisionAttempts,
  dailyTasks,
  dailyActivity,
  contestParticipations,
} from "@/db/schema";

describe("Database Schema Definitions (17 Tables)", () => {
  it("exports all 17 canonical tables with correct PostgreSQL table names", () => {
    expect(getTableName(profiles)).toBe("profiles");
    expect(getTableName(userSettings)).toBe("user_settings");
    expect(getTableName(problems)).toBe("problems");
    expect(getTableName(patterns)).toBe("patterns");
    expect(getTableName(topics)).toBe("topics");
    expect(getTableName(problemPatterns)).toBe("problem_patterns");
    expect(getTableName(problemTopics)).toBe("problem_topics");
    expect(getTableName(mistakes)).toBe("mistakes");
    expect(getTableName(weeklyCurriculum)).toBe("weekly_curriculum");
    expect(getTableName(attempts)).toBe("attempts");
    expect(getTableName(attemptMistakes)).toBe("attempt_mistakes");
    expect(getTableName(journalEntries)).toBe("journal_entries");
    expect(getTableName(revisions)).toBe("revisions");
    expect(getTableName(revisionAttempts)).toBe("revision_attempts");
    expect(getTableName(dailyTasks)).toBe("daily_tasks");
    expect(getTableName(dailyActivity)).toBe("daily_activity");
    expect(getTableName(contestParticipations)).toBe("contest_participations");
  });

  it("verifies user_settings default weekly operational targets", () => {
    expect(userSettings.weekdayProblemTarget.default).toBe(2);
    expect(userSettings.weekdayRevisionTarget.default).toBe(1);
    expect(userSettings.saturdayRevisionTarget.default).toBe(3);
    expect(userSettings.difficultyMode.default).toBe("adaptive");
    expect(userSettings.theme.default).toBe("system");
  });

  it("verifies weekly_curriculum corrected schema columns (DSA_OS_DATABASE.md § 20)", () => {
    expect(weeklyCurriculum.dayOfWeek).toBeDefined();
    expect(weeklyCurriculum.focusTitle).toBeDefined();
    expect(weeklyCurriculum.focusDescription).toBeDefined();
    expect(weeklyCurriculum.isActive).toBeDefined();
  });

  it("verifies daily_activity corrected schema columns (DSA_OS_DATABASE.md § 18)", () => {
    expect(dailyActivity.problemsSolved).toBeDefined();
    expect(dailyActivity.revisionsCompleted).toBeDefined();
    expect(dailyActivity.contestParticipated).toBeDefined();
  });

  it("verifies contest_participations corrected MVP schema columns (DSA_OS_DATABASE.md § 19)", () => {
    expect(contestParticipations.contestDate).toBeDefined();
    expect(contestParticipations.platform).toBeDefined();
    expect(contestParticipations.contestName).toBeDefined();
    expect(contestParticipations.participated).toBeDefined();
  });

  it("verifies primary keys and foreign key reference columns", () => {
    expect(profiles.id).toBeDefined();
    expect(userSettings.userId).toBeDefined();
    expect(attempts.userId).toBeDefined();
    expect(attempts.problemId).toBeDefined();
    expect(journalEntries.userId).toBeDefined();
    expect(journalEntries.problemId).toBeDefined();
    expect(revisions.userId).toBeDefined();
    expect(revisions.problemId).toBeDefined();
    expect(dailyTasks.userId).toBeDefined();
    expect(dailyActivity.userId).toBeDefined();
  });
});
