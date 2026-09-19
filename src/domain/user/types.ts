import { Profile, UserSettings } from "@/db/schema";

export const DAY_NAMES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];

export interface DayContext {
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 1 (Monday) to 7 (Sunday)
  dayName: DayName;
  isWeekday: boolean; // Monday - Friday (1 - 5)
  isSaturday: boolean; // Saturday (6)
  isSunday: boolean; // Sunday (7)
  startOfDayUtc: Date;
  endOfDayUtc: Date;
  timezone: string;
}

export interface UserContext {
  profile: Profile;
  settings: UserSettings;
}

export interface UpdateUserProfileInput {
  displayName?: string;
  timezone?: string;
}

export interface UpdateUserSettingsInput {
  weekdayProblemTarget?: number;
  difficultyMode?: "adaptive" | "easy" | "medium" | "mixed";
  practiceDays?: number[];
  weekdayRevisionTarget?: number;
  saturdayRevisionTarget?: number;
  dailyPracticeReminderEnabled?: boolean;
  revisionReminderEnabled?: boolean;
  reminderTime?: string;
  theme?: "light" | "dark" | "system";
}
