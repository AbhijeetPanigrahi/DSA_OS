import { DbOrTx } from "../transaction";
import {
  getJournalEntriesByUserId,
  getJournalEntryById,
  getJournalEntryByProblem,
  getJournalEntryWithDetails,
  GetJournalEntriesOptions,
  JournalEntryWithDetails,
} from "../queries/journal";
import { upsertJournalEntry } from "../mutations/journal";
import { NewJournalEntry, JournalEntry } from "../schema";

export class JournalRepository {
  /**
   * Saves or updates a Pattern Journal entry for a problem, ensuring the invariant
   * of exactly one current journal entry per user/problem.
   */
  async saveJournalEntry(
    data: NewJournalEntry,
    client?: DbOrTx
  ): Promise<JournalEntry> {
    return await upsertJournalEntry(data, client);
  }

  /**
   * Retrieves the journal entry for a specific problem.
   */
  async getJournalForProblem(
    userId: string,
    problemId: string,
    client?: DbOrTx
  ): Promise<JournalEntry | null> {
    return await getJournalEntryByProblem(userId, problemId, client);
  }

  /**
   * Retrieves a journal entry with connected problem and pattern details.
   */
  async getJournalDetails(
    userId: string,
    id: string,
    client?: DbOrTx
  ): Promise<JournalEntryWithDetails | null> {
    return await getJournalEntryWithDetails(userId, id, client);
  }

  /**
   * Lists journal entries for a user with optional pattern filtering.
   */
  async listUserJournal(
    userId: string,
    options: GetJournalEntriesOptions = {},
    client?: DbOrTx
  ): Promise<JournalEntry[]> {
    return await getJournalEntriesByUserId(userId, options, client);
  }
}

export const journalRepository = new JournalRepository();
