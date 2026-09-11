import { relations } from "drizzle-orm";
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

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  settings: one(userSettings, {
    fields: [profiles.id],
    references: [userSettings.userId],
  }),
  attempts: many(attempts),
  journalEntries: many(journalEntries),
  revisions: many(revisions),
  revisionAttempts: many(revisionAttempts),
  dailyTasks: many(dailyTasks),
  dailyActivities: many(dailyActivity),
  contestParticipations: many(contestParticipations),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  profile: one(profiles, {
    fields: [userSettings.userId],
    references: [profiles.id],
  }),
}));

export const problemsRelations = relations(problems, ({ many }) => ({
  problemPatterns: many(problemPatterns),
  problemTopics: many(problemTopics),
  attempts: many(attempts),
  journalEntries: many(journalEntries),
  revisions: many(revisions),
  dailyTasks: many(dailyTasks),
}));

export const patternsRelations = relations(patterns, ({ many }) => ({
  problemPatterns: many(problemPatterns),
  journalEntries: many(journalEntries),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  problemTopics: many(problemTopics),
}));

export const problemPatternsRelations = relations(
  problemPatterns,
  ({ one }) => ({
    problem: one(problems, {
      fields: [problemPatterns.problemId],
      references: [problems.id],
    }),
    pattern: one(patterns, {
      fields: [problemPatterns.patternId],
      references: [patterns.id],
    }),
  })
);

export const problemTopicsRelations = relations(problemTopics, ({ one }) => ({
  problem: one(problems, {
    fields: [problemTopics.problemId],
    references: [problems.id],
  }),
  topic: one(topics, {
    fields: [problemTopics.topicId],
    references: [topics.id],
  }),
}));

export const mistakesRelations = relations(mistakes, ({ many }) => ({
  attemptMistakes: many(attemptMistakes),
}));

export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  user: one(profiles, {
    fields: [attempts.userId],
    references: [profiles.id],
  }),
  problem: one(problems, {
    fields: [attempts.problemId],
    references: [problems.id],
  }),
  attemptMistakes: many(attemptMistakes),
  journalEntry: one(journalEntries, {
    fields: [attempts.id],
    references: [journalEntries.attemptId],
  }),
}));

export const attemptMistakesRelations = relations(
  attemptMistakes,
  ({ one }) => ({
    attempt: one(attempts, {
      fields: [attemptMistakes.attemptId],
      references: [attempts.id],
    }),
    mistake: one(mistakes, {
      fields: [attemptMistakes.mistakeId],
      references: [mistakes.id],
    }),
  })
);

export const journalEntriesRelations = relations(
  journalEntries,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [journalEntries.userId],
      references: [profiles.id],
    }),
    problem: one(problems, {
      fields: [journalEntries.problemId],
      references: [problems.id],
    }),
    attempt: one(attempts, {
      fields: [journalEntries.attemptId],
      references: [attempts.id],
    }),
    pattern: one(patterns, {
      fields: [journalEntries.patternId],
      references: [patterns.id],
    }),
    revisions: many(revisions),
  })
);

export const revisionsRelations = relations(revisions, ({ one, many }) => ({
  user: one(profiles, {
    fields: [revisions.userId],
    references: [profiles.id],
  }),
  problem: one(problems, {
    fields: [revisions.problemId],
    references: [problems.id],
  }),
  journalEntry: one(journalEntries, {
    fields: [revisions.journalEntryId],
    references: [journalEntries.id],
  }),
  revisionAttempts: many(revisionAttempts),
  dailyTasks: many(dailyTasks),
}));

export const revisionAttemptsRelations = relations(
  revisionAttempts,
  ({ one }) => ({
    revision: one(revisions, {
      fields: [revisionAttempts.revisionId],
      references: [revisions.id],
    }),
    user: one(profiles, {
      fields: [revisionAttempts.userId],
      references: [profiles.id],
    }),
  })
);

export const dailyTasksRelations = relations(dailyTasks, ({ one }) => ({
  user: one(profiles, {
    fields: [dailyTasks.userId],
    references: [profiles.id],
  }),
  problem: one(problems, {
    fields: [dailyTasks.problemId],
    references: [problems.id],
  }),
  revision: one(revisions, {
    fields: [dailyTasks.revisionId],
    references: [revisions.id],
  }),
}));

export const dailyActivityRelations = relations(dailyActivity, ({ one }) => ({
  user: one(profiles, {
    fields: [dailyActivity.userId],
    references: [profiles.id],
  }),
}));

export const contestParticipationsRelations = relations(
  contestParticipations,
  ({ one }) => ({
    user: one(profiles, {
      fields: [contestParticipations.userId],
      references: [profiles.id],
    }),
  })
);
