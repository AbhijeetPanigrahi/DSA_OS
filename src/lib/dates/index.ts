import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { format } from "date-fns";

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Validates whether a string is a recognized IANA timezone identifier.
 */
export function isValidIanaTimezone(timezone: string): boolean {
  if (!timezone || typeof timezone !== "string" || timezone.trim().length === 0) {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone.trim() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Asserts that the provided timezone is a valid IANA timezone identifier,
 * throwing an error if invalid.
 */
export function assertValidTimezone(timezone: string): void {
  if (!isValidIanaTimezone(timezone)) {
    throw new Error(`Invalid IANA timezone identifier: "${timezone}"`);
  }
}

/**
 * Formats a UTC timestamp into the user's local calendar date string (YYYY-MM-DD).
 */
export function getUserLocalDate(
  timestamp: Date = new Date(),
  timezone: string
): string {
  assertValidTimezone(timezone);
  return formatInTimeZone(timestamp, timezone, "yyyy-MM-dd");
}

/**
 * Returns the ISO weekday (1 = Monday, 2 = Tuesday, ..., 7 = Sunday)
 * for a local calendar date string (YYYY-MM-DD).
 */
export function getUserLocalWeekday(localDate: string): number {
  const match = DATE_REGEX.exec(localDate);
  if (!match) {
    throw new Error(
      `Invalid calendar date string: "${localDate}". Expected YYYY-MM-DD`
    );
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = utcDate.getUTCDay();
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

/**
 * Returns the UTC Date representing 00:00:00.000 (start of day) in the user's local timezone.
 */
export function getStartOfUserDay(dateStr: string, timezone: string): Date {
  assertValidTimezone(timezone);
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error(`Invalid calendar date string: "${dateStr}". Expected YYYY-MM-DD`);
  }
  return fromZonedTime(`${dateStr} 00:00:00`, timezone);
}

/**
 * Returns the UTC Date representing the last millisecond of the user's local day
 * (computed as 1 millisecond before the start of the next calendar day to cleanly handle DST).
 */
export function getEndOfUserDay(dateStr: string, timezone: string): Date {
  assertValidTimezone(timezone);
  const nextDayStr = addLocalDays(dateStr, 1);
  const nextDayStart = getStartOfUserDay(nextDayStr, timezone);
  return new Date(nextDayStart.getTime() - 1);
}

/**
 * Adds or subtracts integer days to a local calendar date string (YYYY-MM-DD),
 * operating purely on calendar math independent of UTC elapsed hours or DST.
 */
export function addLocalDays(dateStr: string, days: number): string {
  const match = DATE_REGEX.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid calendar date string: "${dateStr}". Expected YYYY-MM-DD`);
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const utcDate = new Date(Date.UTC(year, month - 1, day + days));
  const y = utcDate.getUTCFullYear();
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utcDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the calendar day difference (dateStrLeft - dateStrRight) in days,
 * independent of DST or timezones.
 */
export function differenceInLocalDays(
  dateStrLeft: string,
  dateStrRight: string
): number {
  const matchLeft = DATE_REGEX.exec(dateStrLeft);
  const matchRight = DATE_REGEX.exec(dateStrRight);
  if (!matchLeft || !matchRight) {
    throw new Error("Invalid calendar date string. Expected YYYY-MM-DD");
  }
  const leftUtc = Date.UTC(
    parseInt(matchLeft[1], 10),
    parseInt(matchLeft[2], 10) - 1,
    parseInt(matchLeft[3], 10)
  );
  const rightUtc = Date.UTC(
    parseInt(matchRight[1], 10),
    parseInt(matchRight[2], 10) - 1,
    parseInt(matchRight[3], 10)
  );
  return Math.round((leftUtc - rightUtc) / 86400000);
}

/**
 * Returns whether two UTC Date timestamps fall on the same local calendar day in the given timezone.
 */
export function isSameLocalDay(
  dateA: Date,
  dateB: Date,
  timezone: string
): boolean {
  assertValidTimezone(timezone);
  return getUserLocalDate(dateA, timezone) === getUserLocalDate(dateB, timezone);
}

/**
 * Returns week boundaries (Monday 00:00:00.000 to Sunday 23:59:59.999) in the user's local timezone
 * containing the given reference date.
 */
export function getUserLocalWeekBoundaries(
  referenceDate: Date = new Date(),
  timezone: string
): {
  startOfWeekUtc: Date;
  endOfWeekUtc: Date;
  startOfWeekDateStr: string;
  endOfWeekDateStr: string;
} {
  assertValidTimezone(timezone);
  const currentDateStr = getUserLocalDate(referenceDate, timezone);
  const currentWeekday = getUserLocalWeekday(currentDateStr); // 1 = Monday, ..., 7 = Sunday
  
  const mondayOffset = 1 - currentWeekday;
  const sundayOffset = 7 - currentWeekday;

  const startOfWeekDateStr = addLocalDays(currentDateStr, mondayOffset);
  const endOfWeekDateStr = addLocalDays(currentDateStr, sundayOffset);

  const startOfWeekUtc = getStartOfUserDay(startOfWeekDateStr, timezone);
  const endOfWeekUtc = getEndOfUserDay(endOfWeekDateStr, timezone);

  return {
    startOfWeekUtc,
    endOfWeekUtc,
    startOfWeekDateStr,
    endOfWeekDateStr,
  };
}

/**
 * Formats a calendar date string (YYYY-MM-DD) for display.
 */
export function formatUserDateDisplay(
  dateStr: string,
  formatPattern = "EEEE, MMMM d, yyyy"
): string {
  const match = DATE_REGEX.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid calendar date string: "${dateStr}". Expected YYYY-MM-DD`);
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const d = new Date(year, month - 1, day);
  return format(d, formatPattern);
}

/**
 * Formats a UTC timestamp into a user's local time display string (e.g. "09:30 AM").
 */
export function formatUserTimeDisplay(
  timestamp: Date,
  timezone: string,
  formatPattern = "hh:mm a"
): string {
  assertValidTimezone(timezone);
  return formatInTimeZone(timestamp, timezone, formatPattern);
}
