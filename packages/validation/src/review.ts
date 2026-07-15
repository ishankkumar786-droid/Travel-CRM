import { z } from 'zod';
import { objectIdSchema } from './common';

export const reviewRequestSchema = z.object({
  travelerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  travelerEmail: z.string().email('Invalid email address'),
  packageId: objectIdSchema.optional(),
});

export const submitReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});
