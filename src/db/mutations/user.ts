import { eq, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  profiles,
  userSettings,
  NewProfile,
  NewUserSettings,
  Profile,
  UserSettings,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function upsertProfile(
  data: NewProfile,
  client: DbOrTx = defaultDb
): Promise<Profile> {
  try {
    const result = await client
      .insert(profiles)
      .values(data)
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          displayName: data.displayName,
          timezone: data.timezone || "UTC",
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, `upsertProfile(${data.id}) mutation`);
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Omit<NewProfile, "id">>,
  client: DbOrTx = defaultDb
): Promise<Profile | null> {
  try {
    const result = await client
      .update(profiles)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(eq(profiles.id, userId))
      .returning();

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `updateProfile(${userId}) mutation`);
  }
}

export async function upsertUserSettings(
  data: NewUserSettings,
  client: DbOrTx = defaultDb
): Promise<UserSettings> {
  try {
    const result = await client
      .insert(userSettings)
      .values(data)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...data,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    handleDatabaseError(error, `upsertUserSettings(${data.userId}) mutation`);
  }
}

export async function updateUserSettings(
  userId: string,
  data: Partial<Omit<NewUserSettings, "userId">>,
  client: DbOrTx = defaultDb
): Promise<UserSettings | null> {
  try {
    const result = await client
      .update(userSettings)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `updateUserSettings(${userId}) mutation`);
  }
}
