import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import { DEFAULT_TIMEZONE } from "@/config/business-rules";

export function getUserLocalDate(date: Date = new Date(), timezone: string = DEFAULT_TIMEZONE): string {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function getUserLocalWeekday(date: Date = new Date(), timezone: string = DEFAULT_TIMEZONE): number {
  // Returns 1 (Monday) to 7 (Sunday)
  const day = parseInt(formatInTimeZone(date, timezone, "i"), 10);
  return day;
}

export function getStartOfUserDay(dateStr: string, timezone: string = DEFAULT_TIMEZONE): Date {
  const localDate = new Date(`${dateStr}T00:00:00`);
  return fromZonedTime(localDate, timezone);
}

export function getEndOfUserDay(dateStr: string, timezone: string = DEFAULT_TIMEZONE): Date {
  const localDate = new Date(`${dateStr}T23:59:59.999`);
  return fromZonedTime(localDate, timezone);
}

export function formatUserDateDisplay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return format(d, "EEEE, MMMM d, yyyy");
}
