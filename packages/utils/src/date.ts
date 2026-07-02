/**
 * Date utility functions.
 */

/** Format a date to ISO string (without milliseconds) */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/** Get current UTC timestamp */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Check if a value is a valid Date */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/** Add days to a date */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Difference in days between two dates */
export function daysDiff(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}
