import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  date,
  smallint,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { profiles } from "./auth";
import { problems } from "./curriculum";
import { revisions } from "./revisions";

export const dailyTasks = pgTable(
  "daily_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    taskDate: date("task_date").notNull(), // User's local date YYYY-MM-DD
    taskType: text("task_type").notNull(), // new_problem | revision | contest
    slotNumber: smallint("slot_number").notNull(),
    problemId: uuid("problem_id").references(() => problems.id, {
      onDelete: "cascade",
    }),
    revisionId: uuid("revision_id").references(() => revisions.id, {
      onDelete: "cascade",
    }),
    status: text("status").notNull().default("pending"), // pending | completed | skipped
    source: text("source").notNull().default("scheduler"), // scheduler | manual | system
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_tasks_slot_idx").on(
      table.userId,
      table.taskDate,
      table.taskType,
      table.slotNumber
    ),
  ]
);

export const dailyActivity = pgTable(
  "daily_activity",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    activityDate: date("activity_date").notNull(), // User's local date YYYY-MM-DD
    problemsSolved: smallint("problems_solved").notNull().default(0),
    revisionsCompleted: smallint("revisions_completed").notNull().default(0),
    contestParticipated: boolean("contest_participated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_activity_user_date_idx").on(
      table.userId,
      table.activityDate
    ),
  ]
);

export const contestParticipations = pgTable("contest_participations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  contestDate: date("contest_date").notNull(), // User's local Sunday date
  platform: text("platform").notNull().default("leetcode"),
  contestName: text("contest_name")
    .notNull()
    .default("LeetCode Weekly Contest"),
  url: text("url"),
  participated: boolean("participated").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
