import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  smallint,
  primaryKey,
} from "drizzle-orm/pg-core";

export const problems = pgTable("problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  platform: text("platform").notNull(), // leetcode | geeksforgeeks | hackerrank | codeforces | codechef | other
  url: text("url").notNull(),
  difficulty: text("difficulty").notNull(), // easy | medium | hard
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const patterns = pgTable("patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const problemPatterns = pgTable(
  "problem_patterns",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    patternId: uuid("pattern_id")
      .notNull()
      .references(() => patterns.id, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.problemId, table.patternId] }),
  ]
);

export const problemTopics = pgTable(
  "problem_topics",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.problemId, table.topicId] }),
  ]
);

export const mistakes = pgTable("mistakes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(), // problem_understanding | finding_approach | pattern_recognition | optimization | implementation | edge_case | time_management | complexity
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const weeklyCurriculum = pgTable("weekly_curriculum", {
  id: uuid("id").defaultRandom().primaryKey(),
  dayOfWeek: smallint("day_of_week").notNull(), // 1 (Mon) to 7 (Sun)
  focusTitle: text("focus_title").notNull(),
  focusDescription: text("focus_description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
