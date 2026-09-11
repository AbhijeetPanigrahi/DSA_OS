import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./auth";
import { problems, patterns } from "./curriculum";
import { attempts } from "./attempts";

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    attemptId: uuid("attempt_id").references(() => attempts.id, {
      onDelete: "set null",
    }),
    patternId: uuid("pattern_id").references(() => patterns.id, {
      onDelete: "set null",
    }),
    failedIdea: text("failed_idea"),
    keyObservation: text("key_observation"),
    timeComplexity: text("time_complexity"),
    spaceComplexity: text("space_complexity"),
    whatToRemember: text("what_to_remember").notNull(),
    patternRecognition: text("pattern_recognition"), // independent | after_hint | not_recognized
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("journal_user_problem_idx").on(table.userId, table.problemId),
  ]
);
