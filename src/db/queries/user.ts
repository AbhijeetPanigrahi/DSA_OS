import { eq } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import { profiles, userSettings, Profile, UserSettings } from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function getProfileById(
  userId: string,
  client: DbOrTx = defaultDb
): Promise<Profile | null> {
  try {
    const result = await client
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getProfileById(${userId}) query`);
  }
}

export async function getUserSettings(
  userId: string,
  client: DbOrTx = defaultDb
): Promise<UserSettings | null> {
  try {
    const result = await client
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error, `getUserSettings(${userId}) query`);
  }
}
