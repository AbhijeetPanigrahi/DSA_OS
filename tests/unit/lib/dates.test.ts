import { describe, it, expect } from "vitest";
import {
  isValidIanaTimezone,
  assertValidTimezone,
  getUserLocalDate,
  getUserLocalWeekday,
  getStartOfUserDay,
  getEndOfUserDay,
  addLocalDays,
  differenceInLocalDays,
  isSameLocalDay,
  getUserLocalWeekBoundaries,
  formatUserDateDisplay,
  formatUserTimeDisplay,
} from "@/lib/dates";

describe("Date & Timezone Utilities (src/lib/dates)", () => {
  describe("isValidIanaTimezone & assertValidTimezone", () => {
    it("should accept valid standard IANA timezones", () => {
      expect(isValidIanaTimezone("UTC")).toBe(true);
      expect(isValidIanaTimezone("Asia/Kolkata")).toBe(true);
      expect(isValidIanaTimezone("America/New_York")).toBe(true);
      expect(isValidIanaTimezone("Europe/London")).toBe(true);
      expect(isValidIanaTimezone("Australia/Sydney")).toBe(true);
      expect(isValidIanaTimezone("Pacific/Auckland")).toBe(true);
      expect(isValidIanaTimezone("Pacific/Honolulu")).toBe(true);
    });

    it("should reject invalid timezone strings", () => {
      expect(isValidIanaTimezone("")).toBe(false);
      expect(isValidIanaTimezone("   ")).toBe(false);
      expect(isValidIanaTimezone("Invalid/Timezone")).toBe(false);
      expect(isValidIanaTimezone("GMT+5")).toBe(false);
      expect(isValidIanaTimezone("Mars/Curiosity")).toBe(false);
    });

    it("should throw on assertValidTimezone with invalid timezone", () => {
      expect(() => assertValidTimezone("Fake/TZ")).toThrow(
        'Invalid IANA timezone identifier: "Fake/TZ"'
      );
      expect(() => assertValidTimezone("Asia/Kolkata")).not.toThrow();
    });
  });

  describe("getUserLocalDate & Midnight Boundaries", () => {
    it("should accurately resolve local date across positive timezone offsets (IST +5:30)", () => {
      // 2026-09-18 18:29:59.999 UTC = 2026-09-18 23:59:59.999 IST
      const beforeMidnight = new Date("2026-09-18T18:29:59.999Z");
      expect(getUserLocalDate(beforeMidnight, "Asia/Kolkata")).toBe("2026-09-18");

      // 2026-09-18 18:30:00.000 UTC = 2026-09-19 00:00:00.000 IST
      const atMidnight = new Date("2026-09-18T18:30:00.000Z");
      expect(getUserLocalDate(atMidnight, "Asia/Kolkata")).toBe("2026-09-19");
    });

    it("should accurately resolve local date across negative timezone offsets (EDT -4:00)", () => {
      // 2026-09-19 03:59:59.999 UTC = 2026-09-18 23:59:59.999 EDT
      const beforeMidnight = new Date("2026-09-19T03:59:59.999Z");
      expect(getUserLocalDate(beforeMidnight, "America/New_York")).toBe("2026-09-18");

      // 2026-09-19 04:00:00.000 UTC = 2026-09-19 00:00:00.000 EDT
      const atMidnight = new Date("2026-09-19T04:00:00.000Z");
      expect(getUserLocalDate(atMidnight, "America/New_York")).toBe("2026-09-19");
    });

    it("should accurately resolve local date across fractional offsets (Nepal +5:45, Adelaide +9:30)", () => {
      // Nepal (+5:45): 18:14:59.999 UTC -> 23:59:59.999 Nepal (same day), 18:15:00.000 UTC -> next day
      const beforeKathmandu = new Date("2026-09-18T18:14:59.999Z");
      const atKathmandu = new Date("2026-09-18T18:15:00.000Z");
      expect(getUserLocalDate(beforeKathmandu, "Asia/Kathmandu")).toBe("2026-09-18");
      expect(getUserLocalDate(atKathmandu, "Asia/Kathmandu")).toBe("2026-09-19");
    });

    it("should accurately resolve extreme timezone offsets (+14 Kiritimati, -11 Niue)", () => {
      // UTC 2026-09-18 12:00:00Z
      const testInstant = new Date("2026-09-18T12:00:00.000Z");
      // Pacific/Kiritimati (+14:00) -> 2026-09-19 02:00:00
      expect(getUserLocalDate(testInstant, "Pacific/Kiritimati")).toBe("2026-09-19");
      // Pacific/Niue (-11:00) -> 2026-09-18 01:00:00
      expect(getUserLocalDate(testInstant, "Pacific/Niue")).toBe("2026-09-18");
    });
  });

  describe("getUserLocalWeekday", () => {
    it("should return ISO weekday 1..7 from calendar date strings", () => {
      expect(getUserLocalWeekday("2026-08-24")).toBe(1); // Monday
      expect(getUserLocalWeekday("2026-08-25")).toBe(2); // Tuesday
      expect(getUserLocalWeekday("2026-08-26")).toBe(3); // Wednesday
      expect(getUserLocalWeekday("2026-08-27")).toBe(4); // Thursday
      expect(getUserLocalWeekday("2026-08-28")).toBe(5); // Friday
      expect(getUserLocalWeekday("2026-08-29")).toBe(6); // Saturday
      expect(getUserLocalWeekday("2026-08-30")).toBe(7); // Sunday
    });

    it("should return ISO weekday from Date object when first converted to local date string", () => {
      // 2026-08-24 03:59:00 UTC = 2026-08-23 23:59:00 EDT (Sunday) vs 2026-08-24 12:59:00 JST (Monday)
      const date = new Date("2026-08-24T03:59:00.000Z");
      const edtLocalDate = getUserLocalDate(date, "America/New_York");
      const jstLocalDate = getUserLocalDate(date, "Asia/Tokyo");

      expect(getUserLocalWeekday(edtLocalDate)).toBe(7); // Sunday EDT
      expect(getUserLocalWeekday(jstLocalDate)).toBe(1); // Monday JST
    });

    it("should reject invalid date string format", () => {
      expect(() => getUserLocalWeekday("24-08-2026")).toThrow(
        'Invalid calendar date string: "24-08-2026"'
      );
    });
  });

  describe("getStartOfUserDay & getEndOfUserDay", () => {
    it("should compute start and end of day in UTC for IST (+5:30)", () => {
      const start = getStartOfUserDay("2026-09-19", "Asia/Kolkata");
      const end = getEndOfUserDay("2026-09-19", "Asia/Kolkata");

      expect(start.toISOString()).toBe("2026-09-18T18:30:00.000Z");
      expect(end.toISOString()).toBe("2026-09-19T18:29:59.999Z");
      expect(end.getTime() - start.getTime()).toBe(86400000 - 1);
    });

    it("should compute start and end of day in UTC for EDT (-4:00)", () => {
      const start = getStartOfUserDay("2026-09-19", "America/New_York");
      const end = getEndOfUserDay("2026-09-19", "America/New_York");

      expect(start.toISOString()).toBe("2026-09-19T04:00:00.000Z");
      expect(end.toISOString()).toBe("2026-09-20T03:59:59.999Z");
    });

    it("should handle Daylight Saving Time (DST) Fall-back 25-hour day cleanly in America/New_York", () => {
      // November 1, 2026 is DST Fall-back in US (Clocks turn back at 02:00 from EDT UTC-4 to EST UTC-5)
      const startOfNov1 = getStartOfUserDay("2026-11-01", "America/New_York");
      const endOfNov1 = getEndOfUserDay("2026-11-01", "America/New_York");
      const startOfNov2 = getStartOfUserDay("2026-11-02", "America/New_York");

      // Nov 1 starts at 00:00 EDT (04:00 UTC)
      expect(startOfNov1.toISOString()).toBe("2026-11-01T04:00:00.000Z");
      // Nov 2 starts at 00:00 EST (05:00 UTC)
      expect(startOfNov2.toISOString()).toBe("2026-11-02T05:00:00.000Z");
      // End of Nov 1 is 1ms before Nov 2 start
      expect(endOfNov1.toISOString()).toBe("2026-11-02T04:59:59.999Z");

      // Total day length is exactly 25 hours (90,000,000 ms - 1 ms)
      expect(endOfNov1.getTime() - startOfNov1.getTime()).toBe(25 * 3600 * 1000 - 1);
    });

    it("should handle Daylight Saving Time (DST) Spring-forward 23-hour day cleanly in America/New_York", () => {
      // March 8, 2026 is DST Spring-forward in US (Clocks jump from 02:00 EST UTC-5 to 03:00 EDT UTC-4)
      const startOfMar8 = getStartOfUserDay("2026-03-08", "America/New_York");
      const endOfMar8 = getEndOfUserDay("2026-03-08", "America/New_York");
      const startOfMar9 = getStartOfUserDay("2026-03-09", "America/New_York");

      // Mar 8 starts at 00:00 EST (05:00 UTC)
      expect(startOfMar8.toISOString()).toBe("2026-03-08T05:00:00.000Z");
      // Mar 9 starts at 00:00 EDT (04:00 UTC)
      expect(startOfMar9.toISOString()).toBe("2026-03-09T04:00:00.000Z");
      // End of Mar 8 is 1ms before Mar 9 start
      expect(endOfMar8.toISOString()).toBe("2026-03-09T03:59:59.999Z");

      // Total day length is exactly 23 hours (82,800,000 ms - 1 ms)
      expect(endOfMar8.getTime() - startOfMar8.getTime()).toBe(23 * 3600 * 1000 - 1);
    });
  });

  describe("Calendar Date Math (addLocalDays & differenceInLocalDays)", () => {
    it("should correctly add and subtract days across month and year boundaries", () => {
      expect(addLocalDays("2026-09-19", 3)).toBe("2026-09-22");
      expect(addLocalDays("2026-09-30", 1)).toBe("2026-10-01");
      expect(addLocalDays("2026-12-31", 1)).toBe("2027-01-01");
      expect(addLocalDays("2026-03-01", -1)).toBe("2026-02-28");
    });

    it("should respect leap years in calendar date arithmetic", () => {
      expect(addLocalDays("2024-02-28", 1)).toBe("2024-02-29"); // Leap year
      expect(addLocalDays("2026-02-28", 1)).toBe("2026-03-01"); // Non-leap year
    });

    it("should compute difference in calendar days independently of time of day or DST", () => {
      expect(differenceInLocalDays("2026-09-22", "2026-09-19")).toBe(3);
      expect(differenceInLocalDays("2026-09-19", "2026-09-22")).toBe(-3);
      expect(differenceInLocalDays("2026-10-02", "2026-09-30")).toBe(2);
    });
  });

  describe("isSameLocalDay", () => {
    it("should determine whether two timestamps fall on the same local date", () => {
      const time1 = new Date("2026-09-19T05:00:00.000Z"); // 10:30 IST
      const time2 = new Date("2026-09-19T18:00:00.000Z"); // 23:30 IST
      const time3 = new Date("2026-09-19T18:35:00.000Z"); // 00:05 IST (Next day)

      expect(isSameLocalDay(time1, time2, "Asia/Kolkata")).toBe(true);
      expect(isSameLocalDay(time2, time3, "Asia/Kolkata")).toBe(false);
    });
  });

  describe("getUserLocalWeekBoundaries", () => {
    it("should return Monday to Sunday boundaries for a midweek date", () => {
      // Wednesday 2026-09-16 12:00:00 UTC
      const wednesday = new Date("2026-09-16T12:00:00.000Z");
      const boundaries = getUserLocalWeekBoundaries(wednesday, "Asia/Kolkata");

      expect(boundaries.startOfWeekDateStr).toBe("2026-09-14"); // Monday
      expect(boundaries.endOfWeekDateStr).toBe("2026-09-20"); // Sunday
      expect(boundaries.startOfWeekUtc.toISOString()).toBe("2026-09-13T18:30:00.000Z");
      expect(boundaries.endOfWeekUtc.toISOString()).toBe("2026-09-20T18:29:59.999Z");
    });

    it("should return the same week boundaries whether tested on Monday or Sunday", () => {
      const monday = new Date("2026-09-14T05:00:00.000Z");
      const sunday = new Date("2026-09-20T15:00:00.000Z");

      const mondayBoundaries = getUserLocalWeekBoundaries(monday, "Asia/Kolkata");
      const sundayBoundaries = getUserLocalWeekBoundaries(sunday, "Asia/Kolkata");

      expect(mondayBoundaries.startOfWeekDateStr).toBe("2026-09-14");
      expect(mondayBoundaries.endOfWeekDateStr).toBe("2026-09-20");
      expect(sundayBoundaries.startOfWeekDateStr).toBe("2026-09-14");
      expect(sundayBoundaries.endOfWeekDateStr).toBe("2026-09-20");
    });
  });

  describe("Display Formatting", () => {
    it("should format calendar date for user display", () => {
      expect(formatUserDateDisplay("2026-09-19")).toBe("Saturday, September 19, 2026");
      expect(formatUserDateDisplay("2026-08-24", "yyyy-MM-dd")).toBe("2026-08-24");
    });

    it("should format user time display in given timezone", () => {
      const instant = new Date("2026-09-19T04:00:00.000Z");
      expect(formatUserTimeDisplay(instant, "Asia/Kolkata")).toBe("09:30 AM");
      expect(formatUserTimeDisplay(instant, "America/New_York")).toBe("12:00 AM");
    });
  });
});
