/**
 * Utility functions for the application
 */

/**
 * Formats a date string as local date (not UTC) to avoid timezone offset issues.
 *
 * When dates come from the database as ISO strings (e.g., "2020-01-15"),
 * using `new Date(dateString)` treats them as UTC, which can cause a 1-day
 * offset when converting to local time in certain timezones.
 *
 * This function parses the date components and creates a Date object
 * with local timezone, ensuring the date displays correctly.
 *
 * @param dateString - ISO date string (e.g., "2020-01-15" or "2020-01-15T00:00:00Z")
 * @returns Formatted local date string
 *
 * @example
 * formatLocalDate("2020-01-15") // "1/15/2020" (in en-US locale)
 * formatLocalDate("2020-01-15T00:00:00Z") // "1/15/2020" (in en-US locale)
 */
export function formatLocalDate(dateString: string): string {
  const [year, month, day] = dateString.split('T')[0].split('-');
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  ).toLocaleDateString();
}

/**
 * Returns the local date in YYYY-MM-DD format for use in HTML date inputs.
 * Avoids using `toISOString()` which is UTC-based and can shift the date.
 */
export function getLocalISODate(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
