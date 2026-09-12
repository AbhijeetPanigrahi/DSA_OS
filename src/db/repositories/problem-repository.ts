import { DbOrTx } from "../transaction";
import {
  getProblems,
  getProblemById,
  getProblemBySlug,
  getProblemWithRelations,
  getPatterns,
  getTopics,
  getMistakes,
  getActiveWeeklyCurriculum,
  GetProblemsOptions,
} from "../queries/curriculum";
import { Problem, Pattern, Topic, Mistake, WeeklyCurriculum } from "../schema";

export interface CurriculumCatalog {
  patterns: Pattern[];
  topics: Topic[];
  mistakes: Mistake[];
  weeklyCurriculum: WeeklyCurriculum[];
}

export class ProblemRepository {
  /**
   * Retrieves a problem by its UUID or slug, including connected patterns and topics.
   */
  async getProblemDetails(idOrSlug: string, client?: DbOrTx) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

    if (isUuid) {
      return await getProblemWithRelations(idOrSlug, client);
    }

    const problem = await getProblemBySlug(idOrSlug, client);
    if (!problem) {
      return null;
    }

    return await getProblemWithRelations(problem.id, client);
  }

  /**
   * Retrieves the full canonical reference catalog for browsing.
   */
  async getCurriculumCatalog(client?: DbOrTx): Promise<CurriculumCatalog> {
    const [patternsList, topicsList, mistakesList, curriculumList] = await Promise.all([
      getPatterns({ isActive: true }, client),
      getTopics({ isActive: true }, client),
      getMistakes({ isActive: true }, client),
      getActiveWeeklyCurriculum(client),
    ]);

    return {
      patterns: patternsList,
      topics: topicsList,
      mistakes: mistakesList,
      weeklyCurriculum: curriculumList,
    };
  }

  /**
   * Lists problems according to filter criteria.
   */
  async listProblems(
    options: GetProblemsOptions = {},
    client?: DbOrTx
  ): Promise<Problem[]> {
    return await getProblems(options, client);
  }
}

export const problemRepository = new ProblemRepository();
