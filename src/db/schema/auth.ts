import {
  pgTable,
  uuid,
  text,
  timestamp,
  smallint,
  boolean,
  time,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // Foreign key to auth.users.id
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  weekdayProblemTarget: smallint("weekday_problem_target")
    .notNull()
    .default(2),
  difficultyMode: text("difficulty_mode").notNull().default("adaptive"), // adaptive | easy | medium | mixed
  practiceDays: smallint("practice_days")
    .array()
    .notNull()
    .default([1, 2, 3, 4, 5]),
  weekdayRevisionTarget: smallint("weekday_revision_target")
    .notNull()
    .default(1),
  saturdayRevisionTarget: smallint("saturday_revision_target")
    .notNull()
    .default(3),
  dailyPracticeReminderEnabled: boolean("daily_practice_reminder_enabled")
    .notNull()
    .default(true),
  revisionReminderEnabled: boolean("revision_reminder_enabled")
    .notNull()
    .default(true),
  reminderTime: time("reminder_time").notNull().default("09:00:00"),
  theme: text("theme").notNull().default("system"), // light | dark | system
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
