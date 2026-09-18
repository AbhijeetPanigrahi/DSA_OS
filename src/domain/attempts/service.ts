import { attemptRepository } from "@/db/repositories/attempt-repository";
import { getMistakeByCode } from "@/db/queries/curriculum";
import { recordAttemptSchema, deriveAttemptFlags } from "./validation";
import { RecordAttemptInput, AttemptFilterOptions } from "./types";
import { ValidationError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { AttemptWithMistakes } from "@/db/queries/attempts";
import { Attempt } from "@/db/schema";

export class AttemptService {
  /**
   * Records a problem-solving attempt with server-side consistency validation
   * and mistake category associations.
   */
  async recordAttempt(
    userId: string,
    input: RecordAttemptInput
  ): Promise<AttemptWithMistakes> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    // 1. Validate input schema & consistency
    const parseResult = recordAttemptSchema.safeParse(input);
    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid attempt data",
        parseResult.error.flatten()
      );
    }

    const validData = parseResult.data;

    // 2. Derive authoritative boolean help flags
    const flags = deriveAttemptFlags(validData.result, {
      usedHint: validData.usedHint,
      sawApproach: validData.sawApproach,
      sawSolution: validData.sawSolution,
    });

    // 3. Resolve mistake codes to mistake IDs if provided
    let mistakeIds: string[] = [];
    if (validData.mistakeCodes && validData.mistakeCodes.length > 0) {
      const resolvedMistakes = await Promise.all(
        validData.mistakeCodes.map((code) => getMistakeByCode(code))
      );

      mistakeIds = resolvedMistakes
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .map((m) => m.id);
    }

    const startedAt = validData.startedAt || new Date();
    const completedAt =
      validData.completedAt !== undefined ? validData.completedAt : new Date();

    // 4. Persist attempt atomically via repository
    return await attemptRepository.recordAttempt(
      {
        userId,
        problemId: validData.problemId,
        startedAt,
        completedAt,
        durationSeconds: validData.durationSeconds ?? null,
        result: validData.result,
        initialApproach: validData.initialApproach ?? null,
        usedHint: flags.usedHint,
        sawApproach: flags.sawApproach,
        sawSolution: flags.sawSolution,
      },
      mistakeIds
    );
  }

  /**
   * Retrieves full attempt details ensuring ownership.
   */
  async getAttemptDetails(
    userId: string,
    attemptId: string
  ): Promise<AttemptWithMistakes> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    const attempt = await attemptRepository.getAttempt(userId, attemptId);
    if (!attempt) {
      throw new NotFoundError(`Attempt ${attemptId} not found`);
    }

    return attempt;
  }

  /**
   * Retrieves attempts for a user with optional filters.
   */
  async getUserAttempts(
    userId: string,
    options: AttemptFilterOptions = {}
  ): Promise<Attempt[]> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await attemptRepository.getUserAttempts(userId, options);
  }

  /**
   * Retrieves the distinct solved problem count for analytics threshold checking.
   */
  async getDistinctSolvedCount(userId: string): Promise<number> {
    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    return await attemptRepository.getDistinctSolvedCount(userId);
  }
}

export const attemptService = new AttemptService();
