import { describe, it, expect } from "vitest";
import { 
  ANALYTICS_UNLOCK_THRESHOLD, 
  REVISION_LADDER_DAYS, 
  INITIAL_REVISION_INTERVAL_DAYS,
  WEEKLY_WORKLOAD_DEFAULTS
} from "@/config/business-rules";
import { getUserLocalDate, getUserLocalWeekday } from "@/lib/dates";

describe("DSA OS Domain Business Rules", () => {
  it("should enforce 10 distinct solved problems threshold for Analytics", () => {
    expect(ANALYTICS_UNLOCK_THRESHOLD).toBe(10);
  });

  it("should have correct initial revision intervals", () => {
    expect(INITIAL_REVISION_INTERVAL_DAYS.independent).toBe(3);
    expect(INITIAL_REVISION_INTERVAL_DAYS.hint).toBe(2);
    expect(INITIAL_REVISION_INTERVAL_DAYS.solution).toBe(1);
    expect(INITIAL_REVISION_INTERVAL_DAYS.failed).toBe(1);
  });

  it("should define standard revision interval ladder", () => {
    expect(REVISION_LADDER_DAYS).toEqual([1, 3, 7, 14, 30, 60]);
  });

  it("should enforce product defaults for weekly workload", () => {
    expect(WEEKLY_WORKLOAD_DEFAULTS.weekdayNewProblems).toBe(2);
    expect(WEEKLY_WORKLOAD_DEFAULTS.weekdayRevisions).toBe(1);
    expect(WEEKLY_WORKLOAD_DEFAULTS.saturdayRevisions).toBe(3);
    expect(WEEKLY_WORKLOAD_DEFAULTS.sundayContestOnly).toBe(true);
  });

  it("should calculate user local date string correctly", () => {
    const testDate = new Date("2026-08-24T12:00:00Z");
    const dateStr = getUserLocalDate(testDate, "Asia/Kolkata");
    expect(dateStr).toBe("2026-08-24");
  });
});
