import { z } from 'zod';

/**
 * Common reusable Zod schemas.
 */

/** MongoDB ObjectId validation */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

/** Non-empty trimmed string */
export const nonEmptyString = z.string().trim().min(1, 'This field is required');

/** Email schema */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address');

/** URL schema */
export const urlSchema = z.string().url('Please enter a valid URL');

/** Phone number (basic international) */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number');

/** Positive integer */
export const positiveInt = z.number().int().positive();

/** Non-negative integer */
export const nonNegativeInt = z.number().int().nonnegative();

/** ISO date string */
export const isoDateString = z
  .string()
  .datetime({ message: 'Please enter a valid ISO date string' });

/** Active status */
export const activeStatusSchema = z.enum(['active', 'inactive', 'pending', 'archived']);

/** Pagination query params schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().trim().optional(),
});
