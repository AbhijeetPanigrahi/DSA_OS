import { userRepository } from "@/db/repositories/user-repository";
import {
  getUserLocalDate,
  getUserLocalWeekday,
  getStartOfUserDay,
  getEndOfUserDay,
  isValidIanaTimezone,
} from "@/lib/dates";
import {
  ianaTimezoneSchema,
  updateUserProfileSchema,
  updateUserSettingsSchema,
} from "./validation";
import {
  UserContext,
  DayContext,
  DayName,
  DAY_NAMES,
  UpdateUserProfileInput,
  UpdateUserSettingsInput,
} from "./types";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { Profile, UserSettings } from "@/db/schema";

export class UserContextService {
  /**
   * Retrieves the combined user context (profile and settings).
   * Strictly asserts that the profile and settings exist and that the profile
   * timezone is a valid IANA identifier, without silent fallbacks.
   */
  async getUserContext(userId: string): Promise<UserContext> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const context = await userRepository.getUserContext(userId);

    if (!context.profile) {
      throw new NotFoundError(`User profile not found for user ID: ${userId}`);
    }

    if (!context.settings) {
      throw new NotFoundError(`User settings not found for user ID: ${userId}`);
    }

    if (!isValidIanaTimezone(context.profile.timezone)) {
      throw new ValidationError(
        `Configured profile timezone "${context.profile.timezone}" is not a valid IANA timezone`
      );
    }

    return {
      profile: context.profile,
      settings: context.settings,
    };
  }

  /**
   * Retrieves the authoritative user timezone from the user's profile.
   */
  async getUserTimezone(userId: string): Promise<string> {
    const { profile } = await this.getUserContext(userId);
    return profile.timezone;
  }

  /**
   * Computes the user-local day context (local date, weekday, day flags, UTC start/end boundaries)
   * for a given reference date (defaults to current time).
   */
  async getUserDayContext(
    userId: string,
    referenceDate: Date = new Date()
  ): Promise<DayContext> {
    const timezone = await this.getUserTimezone(userId);

    const dateStr = getUserLocalDate(referenceDate, timezone);
    const dayOfWeek = getUserLocalWeekday(dateStr); // 1 (Mon) to 7 (Sun)
    const dayName: DayName = DAY_NAMES[dayOfWeek - 1];

    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 7;

    const startOfDayUtc = getStartOfUserDay(dateStr, timezone);
    const endOfDayUtc = getEndOfUserDay(dateStr, timezone);

    return {
      dateStr,
      dayOfWeek,
      dayName,
      isWeekday,
      isSaturday,
      isSunday,
      startOfDayUtc,
      endOfDayUtc,
      timezone,
    };
  }

  /**
   * Updates the user's authoritative timezone after validating that the string is a valid IANA timezone.
   */
  async updateUserTimezone(
    userId: string,
    timezone: string
  ): Promise<Profile> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = ianaTimezoneSchema.safeParse(timezone);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid timezone identifier",
        parseResult.error.flatten()
      );
    }

    const updatedProfile = await userRepository.updateUserProfile(userId, {
      timezone: parseResult.data,
    });

    if (!updatedProfile) {
      throw new NotFoundError(`User profile not found for user ID: ${userId}`);
    }

    return updatedProfile;
  }

  /**
   * Updates user profile attributes (e.g. display name, timezone) with validation.
   */
  async updateUserProfile(
    userId: string,
    input: UpdateUserProfileInput
  ): Promise<Profile> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = updateUserProfileSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid profile update data",
        parseResult.error.flatten()
      );
    }

    const updatedProfile = await userRepository.updateUserProfile(
      userId,
      parseResult.data
    );

    if (!updatedProfile) {
      throw new NotFoundError(`User profile not found for user ID: ${userId}`);
    }

    return updatedProfile;
  }

  /**
   * Updates user settings configuration with validation.
   */
  async updateUserSettings(
    userId: string,
    input: UpdateUserSettingsInput
  ): Promise<UserSettings> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const parseResult = updateUserSettingsSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid settings update data",
        parseResult.error.flatten()
      );
    }

    const updatedSettings = await userRepository.updateUserSettings(
      userId,
      parseResult.data
    );

    if (!updatedSettings) {
      throw new NotFoundError(`User settings not found for user ID: ${userId}`);
    }

    return updatedSettings;
  }
}

export const userContextService = new UserContextService();
