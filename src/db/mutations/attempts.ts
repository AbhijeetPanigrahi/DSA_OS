import { db as defaultDb } from "../client";
import { DbOrTx } from "../transaction";
import {
  attempts,
  attemptMistakes,
  NewAttempt,
  Attempt,
} from "../schema";
import { handleDatabaseError } from "@/lib/errors";

export async function insertAttempt(
  data: NewAttempt,
  client: DbOrTx = defaultDb
): Promise<Attempt> {
  try {
    const result = await client.insert(attempts).values(data).returning();
    return result[0];
  } catch (error) {
    handleDatabaseError(error, "insertAttempt mutation");
  }
}

export async function insertAttemptMistakes(
  attemptId: string,
  mistakeIds: string[],
  client: DbOrTx = defaultDb
): Promise<void> {
  if (!mistakeIds || mistakeIds.length === 0) {
    return;
  }

  try {
    const values = mistakeIds.map((mistakeId) => ({
      attemptId,
      mistakeId,
    }));

    await client.insert(attemptMistakes).values(values).onConflictDoNothing();
  } catch (error) {
    handleDatabaseError(error, `insertAttemptMistakes(${attemptId}) mutation`);
  }
}
