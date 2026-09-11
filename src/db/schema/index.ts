import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export * from "./auth";
export * from "./curriculum";
export * from "./attempts";
export * from "./journal";
export * from "./revisions";
export * from "./scheduling";
export * from "./relations";

// Inferred TypeScript Model Types
import { profiles, userSettings } from "./auth";
import {
  problems,
  patterns,
  topics,
  problemPatterns,
  problemTopics,
  mistakes,
  weeklyCurriculum,
} from "./curriculum";
import { attempts, attemptMistakes } from "./attempts";
import { journalEntries } from "./journal";
import { revisions, revisionAttempts } from "./revisions";
import { dailyTasks, dailyActivity, contestParticipations } from "./scheduling";

export type Profile = InferSelectModel<typeof profiles>;
export type NewProfile = InferInsertModel<typeof profiles>;

export type UserSettings = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;

export type Problem = InferSelectModel<typeof problems>;
export type NewProblem = InferInsertModel<typeof problems>;

export type Pattern = InferSelectModel<typeof patterns>;
export type NewPattern = InferInsertModel<typeof patterns>;

export type Topic = InferSelectModel<typeof topics>;
export type NewTopic = InferInsertModel<typeof topics>;

export type ProblemPattern = InferSelectModel<typeof problemPatterns>;
export type NewProblemPattern = InferInsertModel<typeof problemPatterns>;

export type ProblemTopic = InferSelectModel<typeof problemTopics>;
export type NewProblemTopic = InferInsertModel<typeof problemTopics>;

export type Mistake = InferSelectModel<typeof mistakes>;
export type NewMistake = InferInsertModel<typeof mistakes>;

export type WeeklyCurriculum = InferSelectModel<typeof weeklyCurriculum>;
export type NewWeeklyCurriculum = InferInsertModel<typeof weeklyCurriculum>;

export type Attempt = InferSelectModel<typeof attempts>;
export type NewAttempt = InferInsertModel<typeof attempts>;

export type AttemptMistake = InferSelectModel<typeof attemptMistakes>;
export type NewAttemptMistake = InferInsertModel<typeof attemptMistakes>;

export type JournalEntry = InferSelectModel<typeof journalEntries>;
export type NewJournalEntry = InferInsertModel<typeof journalEntries>;

export type Revision = InferSelectModel<typeof revisions>;
export type NewRevision = InferInsertModel<typeof revisions>;

export type RevisionAttempt = InferSelectModel<typeof revisionAttempts>;
export type NewRevisionAttempt = InferInsertModel<typeof revisionAttempts>;

export type DailyTask = InferSelectModel<typeof dailyTasks>;
export type NewDailyTask = InferInsertModel<typeof dailyTasks>;

export type DailyActivity = InferSelectModel<typeof dailyActivity>;
export type NewDailyActivity = InferInsertModel<typeof dailyActivity>;

export type ContestParticipation = InferSelectModel<typeof contestParticipations>;
export type NewContestParticipation = InferInsertModel<typeof contestParticipations>;
