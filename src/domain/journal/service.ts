import { journalRepository } from "@/db/repositories/journal-repository";
import { attemptRepository } from "@/db/repositories/attempt-repository";
import { saveJournalSchema } from "./validation";
import { SaveJournalInput, JournalFilterOptions } from "./types";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { JournalEntry } from "@/db/schema";
import { JournalEntryWithDetails } from "@/db/queries/journal";

export class JournalService {
  /**
   * Saves or updates a Pattern Journal entry with ownership & integrity checks.
   * If attemptId is supplied, verifies that the attempt belongs to this user
   * and matches the problem.
   */
  async saveJournalEntry(
    userId: string,
    input: SaveJournalInput
  ): Promise<JournalEntry> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    // 1. Validate input schema
    const parseResult = saveJournalSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid journal data",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    // 2. Cross-entity validation: If attemptId is provided, verify ownership & problem match
    if (validData.attemptId) {
      const attempt = await attemptRepository.getAttempt(
        userId,
        validData.attemptId
      );
      if (!attempt) {
        throw new NotFoundError(
          `Attempt ${validData.attemptId} not found or does not belong to user`
        );
      }
      if (attempt.problemId !== validData.problemId) {
        throw new ValidationError("Attempt does not belong to the specified problem");
      }
    }

    // 3. Upsert journal entry via repository
    return await journalRepository.saveJournalEntry({
      userId,
      problemId: validData.problemId,
      attemptId: validData.attemptId ?? null,
      patternId: validData.patternId ?? null,
      failedIdea: validData.failedIdea ?? null,
      keyObservation: validData.keyObservation ?? null,
      timeComplexity: validData.timeComplexity ?? null,
      spaceComplexity: validData.spaceComplexity ?? null,
      whatToRemember: validData.whatToRemember,
      patternRecognition: validData.patternRecognition ?? null,
    });
  }

  /**
   * Retrieves the journal entry for a problem.
   */
  async getJournalForProblem(
    userId: string,
    problemId: string
  ): Promise<JournalEntry | null> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await journalRepository.getJournalForProblem(userId, problemId);
  }

  /**
   * Retrieves full journal details (including joined problem and pattern) with ownership check.
   */
  async getJournalDetails(
    userId: string,
    journalId: string
  ): Promise<JournalEntryWithDetails> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const entry = await journalRepository.getJournalDetails(userId, journalId);
    if (!entry) {
      throw new NotFoundError(`Journal entry ${journalId} not found`);
    }

    return entry;
  }

  /**
   * Lists journal entries for a user with optional pattern filtering.
   */
  async listUserJournal(
    userId: string,
    options: JournalFilterOptions = {}
  ): Promise<JournalEntry[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await journalRepository.listUserJournal(userId, options);
  }
}

export const journalService = new JournalService();
