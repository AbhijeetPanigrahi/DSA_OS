import { DbOrTx, withTransaction } from "../transaction";
import { getProfileById, getUserSettings } from "../queries/user";
import {
  upsertProfile,
  updateProfile,
  upsertUserSettings,
  updateUserSettings,
} from "../mutations/user";
import { Profile, UserSettings, NewUserSettings } from "../schema";

export interface UserContext {
  profile: Profile | null;
  settings: UserSettings | null;
}

export class UserRepository {
  /**
   * Retrieves the combined user context (profile and settings) for the authenticated user.
   */
  async getUserContext(userId: string, client?: DbOrTx): Promise<UserContext> {
    const [profile, settings] = await Promise.all([
      getProfileById(userId, client),
      getUserSettings(userId, client),
    ]);

    return {
      profile,
      settings,
    };
  }

  /**
   * Atomically initializes both profile and default user settings for a newly signed-up user.
   */
  async initializeUserAccount(
    userId: string,
    displayName: string,
    timezone = "UTC",
    existingTx?: DbOrTx
  ): Promise<{ profile: Profile; settings: UserSettings }> {
    return await withTransaction(async (tx) => {
      const profile = await upsertProfile(
        {
          id: userId,
          displayName,
          timezone,
        },
        tx
      );

      const settings = await upsertUserSettings(
        {
          userId,
          weekdayProblemTarget: 2,
          difficultyMode: "adaptive",
          practiceDays: [1, 2, 3, 4, 5],
          weekdayRevisionTarget: 1,
          saturdayRevisionTarget: 3,
          dailyPracticeReminderEnabled: true,
          revisionReminderEnabled: true,
          reminderTime: "09:00:00",
          theme: "system",
        },
        tx
      );

      return { profile, settings };
    }, existingTx);
  }

  /**
   * Updates user profile attributes (e.g. display name, timezone).
   */
  async updateUserProfile(
    userId: string,
    data: { displayName?: string; timezone?: string },
    client?: DbOrTx
  ): Promise<Profile | null> {
    return await updateProfile(userId, data, client);
  }

  /**
   * Updates user settings configuration.
   */
  async updateUserSettings(
    userId: string,
    data: Partial<Omit<NewUserSettings, "userId">>,
    client?: DbOrTx
  ): Promise<UserSettings | null> {
    return await updateUserSettings(userId, data, client);
  }
}

export const userRepository = new UserRepository();
