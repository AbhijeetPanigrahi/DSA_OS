import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  userContextService,
  ianaTimezoneSchema,
  updateUserProfileSchema,
  updateUserSettingsSchema,
} from "@/domain/user";
import { userRepository } from "@/db/repositories/user-repository";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";

vi.mock("@/db/repositories/user-repository");

describe("User Context Domain & Timezone Service", () => {
  const dummyUserId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Schemas", () => {
    it("should accept valid IANA timezone identifiers", () => {
      expect(ianaTimezoneSchema.safeParse("Asia/Kolkata").success).toBe(true);
      expect(ianaTimezoneSchema.safeParse("America/New_York").success).toBe(true);
      expect(ianaTimezoneSchema.safeParse("UTC").success).toBe(true);
      expect(ianaTimezoneSchema.safeParse("Europe/Berlin").success).toBe(true);
    });

    it("should reject invalid IANA timezone identifiers", () => {
      const result = ianaTimezoneSchema.safeParse("Invalid/Timezone");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Invalid IANA timezone identifier"
        );
      }
    });

    it("should validate profile update payload", () => {
      const valid = updateUserProfileSchema.safeParse({
        displayName: "Ada Lovelace",
        timezone: "Europe/London",
      });
      expect(valid.success).toBe(true);

      const invalid = updateUserProfileSchema.safeParse({
        displayName: "",
        timezone: "Invalid_TZ",
      });
      expect(invalid.success).toBe(false);
    });

    it("should validate user settings payload", () => {
      const valid = updateUserSettingsSchema.safeParse({
        weekdayProblemTarget: 3,
        difficultyMode: "adaptive",
        practiceDays: [1, 2, 3, 4, 5],
        weekdayRevisionTarget: 2,
        saturdayRevisionTarget: 3,
        dailyPracticeReminderEnabled: true,
        reminderTime: "08:30:00",
        theme: "dark",
      });
      expect(valid.success).toBe(true);

      const invalid = updateUserSettingsSchema.safeParse({
        weekdayProblemTarget: 20, // max is 10
        reminderTime: "25:00:00", // invalid hour
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("UserContextService", () => {
    const mockProfile = {
      id: dummyUserId,
      displayName: "Grace Hopper",
      timezone: "America/New_York",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSettings = {
      userId: dummyUserId,
      weekdayProblemTarget: 2,
      difficultyMode: "adaptive",
      practiceDays: [1, 2, 3, 4, 5],
      weekdayRevisionTarget: 1,
      saturdayRevisionTarget: 3,
      dailyPracticeReminderEnabled: true,
      revisionReminderEnabled: true,
      reminderTime: "09:00:00",
      theme: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should require userId for retrieving user context", async () => {
      await expect(userContextService.getUserContext("")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw NotFoundError if profile is missing in database", async () => {
      vi.spyOn(userRepository, "getUserContext").mockResolvedValue({
        profile: null,
        settings: mockSettings,
      });

      await expect(
        userContextService.getUserContext(dummyUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if settings are missing in database", async () => {
      vi.spyOn(userRepository, "getUserContext").mockResolvedValue({
        profile: mockProfile,
        settings: null,
      });

      await expect(
        userContextService.getUserContext(dummyUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if configured profile timezone is invalid IANA without silent fallback", async () => {
      vi.spyOn(userRepository, "getUserContext").mockResolvedValue({
        profile: { ...mockProfile, timezone: "Corrupt/Timezone_DB" },
        settings: mockSettings,
      });

      await expect(
        userContextService.getUserContext(dummyUserId)
      ).rejects.toThrow(ValidationError);
    });

    it("should compute authoritative DayContext for user timezone deterministically", async () => {
      vi.spyOn(userRepository, "getUserContext").mockResolvedValue({
        profile: { ...mockProfile, timezone: "Asia/Kolkata" },
        settings: mockSettings,
      });

      // 2026-09-18 19:00:00 UTC = 2026-09-19 00:30:00 IST (Saturday)
      const referenceInstant = new Date("2026-09-18T19:00:00.000Z");
      const dayContext = await userContextService.getUserDayContext(
        dummyUserId,
        referenceInstant
      );

      expect(dayContext.timezone).toBe("Asia/Kolkata");
      expect(dayContext.dateStr).toBe("2026-09-19");
      expect(dayContext.dayOfWeek).toBe(6);
      expect(dayContext.dayName).toBe("saturday");
      expect(dayContext.isWeekday).toBe(false);
      expect(dayContext.isSaturday).toBe(true);
      expect(dayContext.isSunday).toBe(false);
      expect(dayContext.startOfDayUtc.toISOString()).toBe("2026-09-18T18:30:00.000Z");
      expect(dayContext.endOfDayUtc.toISOString()).toBe("2026-09-19T18:29:59.999Z");
    });

    it("should update user timezone after validating IANA identifier", async () => {
      const updatedProfile = {
        ...mockProfile,
        timezone: "Europe/Paris",
      };

      vi.spyOn(userRepository, "updateUserProfile").mockResolvedValue(
        updatedProfile
      );

      const result = await userContextService.updateUserTimezone(
        dummyUserId,
        "Europe/Paris"
      );

      expect(result.timezone).toBe("Europe/Paris");
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith(
        dummyUserId,
        { timezone: "Europe/Paris" }
      );
    });

    it("should reject invalid timezone update", async () => {
      await expect(
        userContextService.updateUserTimezone(dummyUserId, "Not/Real/TZ")
      ).rejects.toThrow(ValidationError);
    });

    it("should update user profile attributes", async () => {
      const updatedProfile = {
        ...mockProfile,
        displayName: "Katherine Johnson",
      };

      vi.spyOn(userRepository, "updateUserProfile").mockResolvedValue(
        updatedProfile
      );

      const result = await userContextService.updateUserProfile(dummyUserId, {
        displayName: "Katherine Johnson",
      });

      expect(result.displayName).toBe("Katherine Johnson");
      expect(userRepository.updateUserProfile).toHaveBeenCalledWith(
        dummyUserId,
        { displayName: "Katherine Johnson" }
      );
    });

    it("should update user settings", async () => {
      const updatedSettings = {
        ...mockSettings,
        weekdayProblemTarget: 3,
      };

      vi.spyOn(userRepository, "updateUserSettings").mockResolvedValue(
        updatedSettings
      );

      const result = await userContextService.updateUserSettings(dummyUserId, {
        weekdayProblemTarget: 3,
      });

      expect(result.weekdayProblemTarget).toBe(3);
      expect(userRepository.updateUserSettings).toHaveBeenCalledWith(
        dummyUserId,
        { weekdayProblemTarget: 3 }
      );
    });
  });
});
