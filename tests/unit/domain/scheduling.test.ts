import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  assignDailyTasksSchema,
  completeTaskSchema,
  recordContestSchema,
  schedulingService,
} from "@/domain/scheduling";
import { schedulingRepository } from "@/db/repositories/scheduling-repository";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

vi.mock("@/db/repositories/scheduling-repository");

describe("Scheduling Domain", () => {
  const dummyUserId = "11111111-1111-4111-8111-111111111111";
  const dummyProblemId = "22222222-2222-4222-8222-222222222222";
  const dummyRevisionId = "33333333-3333-4333-8333-333333333333";
  const dummyTaskId = "44444444-4444-4444-8444-444444444444";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("should accept valid task assignments", () => {
      const result = assignDailyTasksSchema.safeParse({
        taskDate: "2026-08-24",
        tasks: [
          {
            taskType: "new_problem",
            slotNumber: 1,
            problemId: dummyProblemId,
          },
          {
            taskType: "revision",
            slotNumber: 2,
            revisionId: dummyRevisionId,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should reject new_problem task without problemId", () => {
      const result = assignDailyTasksSchema.safeParse({
        taskDate: "2026-08-24",
        tasks: [
          {
            taskType: "new_problem",
            slotNumber: 1,
          },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "problemId is required for new_problem tasks"
        );
      }
    });

    it("should reject revision task without revisionId", () => {
      const result = assignDailyTasksSchema.safeParse({
        taskDate: "2026-08-24",
        tasks: [
          {
            taskType: "revision",
            slotNumber: 1,
          },
        ],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "revisionId is required for revision tasks"
        );
      }
    });

    it("should reject invalid date format", () => {
      const result = assignDailyTasksSchema.safeParse({
        taskDate: "24-08-2026",
        tasks: [
          {
            taskType: "contest",
            slotNumber: 1,
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("SchedulingService", () => {
    it("should reject daily tasks with duplicate slot numbers", async () => {
      await expect(
        schedulingService.assignDailyTasks(dummyUserId, {
          taskDate: "2026-08-24",
          tasks: [
            {
              taskType: "new_problem",
              slotNumber: 1,
              problemId: dummyProblemId,
            },
            {
              taskType: "new_problem",
              slotNumber: 1,
              problemId: dummyProblemId,
            },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should complete pending task and update activity", async () => {
      const mockTask = {
        id: dummyTaskId,
        userId: dummyUserId,
        taskDate: "2026-08-24",
        taskType: "new_problem" as const,
        slotNumber: 1,
        problemId: dummyProblemId,
        revisionId: null,
        status: "pending" as const,
        source: "scheduler" as const,
        completedAt: null,
        createdAt: new Date(),
      };

      const mockCompletedResult = {
        task: { ...mockTask, status: "completed" as const, completedAt: new Date() },
        activity: {
          id: "activity-id",
          userId: dummyUserId,
          activityDate: "2026-08-24",
          problemsSolved: 1,
          revisionsCompleted: 0,
          contestParticipated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.spyOn(schedulingRepository, "getTaskById").mockResolvedValue(mockTask);
      vi.spyOn(
        schedulingRepository,
        "completeTaskAndLogActivity"
      ).mockResolvedValue(mockCompletedResult);

      const result = await schedulingService.completeDailyTask(dummyUserId, {
        taskId: dummyTaskId,
        activityDate: "2026-08-24",
        activityType: "problem",
      });

      expect(result).toEqual(mockCompletedResult);
      expect(
        schedulingRepository.completeTaskAndLogActivity
      ).toHaveBeenCalledWith(
        dummyUserId,
        dummyTaskId,
        "2026-08-24",
        "problem"
      );
    });

    it("should reject completion if task is already completed", async () => {
      vi.spyOn(schedulingRepository, "getTaskById").mockResolvedValue({
        id: dummyTaskId,
        userId: dummyUserId,
        taskDate: "2026-08-24",
        taskType: "new_problem" as const,
        slotNumber: 1,
        problemId: dummyProblemId,
        revisionId: null,
        status: "completed" as const,
        source: "scheduler" as const,
        completedAt: new Date(),
        createdAt: new Date(),
      });

      await expect(
        schedulingService.completeDailyTask(dummyUserId, {
          taskId: dummyTaskId,
          activityDate: "2026-08-24",
          activityType: "problem",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should reject completion if task does not exist", async () => {
      vi.spyOn(schedulingRepository, "getTaskById").mockResolvedValue(null);

      await expect(
        schedulingService.completeDailyTask(dummyUserId, {
          taskId: dummyTaskId,
          activityDate: "2026-08-24",
          activityType: "problem",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should record contest participation and activity", async () => {
      const mockResult = {
        participation: {
          id: "contest-part-id",
          userId: dummyUserId,
          contestName: "Weekly Contest 400",
          contestDate: "2026-08-23",
          platform: "leetcode",
          url: "https://leetcode.com/contest/weekly-contest-400",
          participated: true,
          createdAt: new Date(),
        },
        activity: {
          id: "activity-id-contest",
          userId: dummyUserId,
          activityDate: "2026-08-23",
          problemsSolved: 0,
          revisionsCompleted: 0,
          contestParticipated: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.spyOn(
        schedulingRepository,
        "recordContestParticipationEvent"
      ).mockResolvedValue(mockResult);

      const result = await schedulingService.recordContestParticipation(
        dummyUserId,
        {
          contestName: "Weekly Contest 400",
          contestDate: "2026-08-23",
          platform: "leetcode",
          url: "https://leetcode.com/contest/weekly-contest-400",
        }
      );

      expect(result).toEqual(mockResult);
      expect(
        schedulingRepository.recordContestParticipationEvent
      ).toHaveBeenCalledWith(
        dummyUserId,
        expect.objectContaining({
          contestName: "Weekly Contest 400",
          contestDate: "2026-08-23",
          platform: "leetcode",
        }),
        "2026-08-23"
      );
    });
  });
});
