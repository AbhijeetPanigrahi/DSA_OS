import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { profiles } from "./auth";
import { problems, mistakes } from "./curriculum";

export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  durationSeconds: integer("duration_seconds"),
  result: text("result").notNull(), // independent | hint | approach | solution | failed
  initialApproach: text("initial_approach"),
  usedHint: boolean("used_hint").notNull().default(false),
  sawApproach: boolean("saw_approach").notNull().default(false),
  sawSolution: boolean("saw_solution").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const attemptMistakes = pgTable(
  "attempt_mistakes",
  {
    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => attempts.id, { onDelete: "cascade" }),
    mistakeId: uuid("mistake_id")
      .notNull()
      .references(() => mistakes.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.attemptId, table.mistakeId] }),
  ]
);
