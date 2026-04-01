/**
 * Seattle timezone utilities.
 * All date logic in this app should use these helpers
 * so that dates are consistently interpreted in Pacific Time.
 */

const SEATTLE_TZ = 'America/Los_Angeles';

/**
 * Get the current date/time in Seattle timezone as a Date object.
 * Note: The returned Date still has UTC internals, but the "date" components
 * (year, month, day) reflect Seattle local time.
 */
export function getSeattleNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: SEATTLE_TZ })
  );
}

/**
 * Convert a UTC ISO string (from the database) to Seattle local date string "YYYY-MM-DD".
 */
export function toSeattleDateStr(utcIso: string): string {
  const d = new Date(utcIso);
  return d.toLocaleDateString('en-CA', { timeZone: SEATTLE_TZ }); // en-CA gives YYYY-MM-DD
}

/**
 * Convert a UTC ISO string to Seattle local month string "YYYY-MM".
 */
export function toSeattleMonthStr(utcIso: string): string {
  return toSeattleDateStr(utcIso).slice(0, 7);
}

/**
 * Get the day-of-month (1-31) for a UTC ISO string in Seattle time.
 */
export function toSeattleDay(utcIso: string): number {
  const d = new Date(utcIso);
  return parseInt(
    d.toLocaleDateString('en-US', { timeZone: SEATTLE_TZ, day: 'numeric' }),
    10
  );
}

/**
 * Check if two dates fall on the same calendar day in Seattle time.
 */
export function isSameSeattleDay(utcIso: string, date: Date): boolean {
  const aStr = toSeattleDateStr(utcIso);
  const bStr = date.toLocaleDateString('en-CA', { timeZone: SEATTLE_TZ });
  return aStr === bStr;
}

/**
 * Format a Seattle "today" string as YYYY-MM-DD.
 */
export function getSeattleTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: SEATTLE_TZ });
}

/**
 * Get Seattle month string "YYYY-MM" for today.
 */
export function getSeattleMonthStr(): string {
  return getSeattleTodayStr().slice(0, 7);
}
