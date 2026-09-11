import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./auth";
import { problems } from "./curriculum";
import { journalEntries } from "./journal";

export const revisions = pgTable(
  "revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    journalEntryId: uuid("journal_entry_id").references(
      () => journalEntries.id,
      { onDelete: "set null" }
    ),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull(),
    currentIntervalDays: integer("current_interval_days").notNull().default(1),
    reviewCount: integer("review_count").notNull().default(0),
    status: text("status").notNull().default("active"), // active | paused
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("revisions_user_problem_idx").on(table.userId, table.problemId),
  ]
);

export const revisionAttempts = pgTable("revision_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  revisionId: uuid("revision_id")
    .notNull()
    .references(() => revisions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  recallResult: text("recall_result").notNull(), // easy | partial | forgot
  userPatternAnswer: text("user_pattern_answer"),
  userApproachAnswer: text("user_approach_answer"),
  previousIntervalDays: integer("previous_interval_days"),
  newIntervalDays: integer("new_interval_days"),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
