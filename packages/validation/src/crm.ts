import { z } from 'zod';

import { emailSchema, nonEmptyString, phoneSchema } from './common';

// ─── Contact ──────────────────────────────────────────────────────────────────

export const createContactSchema = z.object({
  firstName: nonEmptyString.max(50),
  lastName: nonEmptyString.max(50),
  designation: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  whatsapp: phoneSchema.optional(),
  linkedin: z.string().url().optional(),
  preferredCommunication: z.enum(['email', 'phone', 'whatsapp', 'in_person']).default('email'),
  isPrimary: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateContactSchema = createContactSchema.partial();

// ─── Activity ─────────────────────────────────────────────────────────────────

export const createActivitySchema = z.object({
  contactId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  type: z.enum(['call', 'meeting', 'email', 'whatsapp', 'visit', 'demo', 'video_call', 'other']),
  title: nonEmptyString.max(200),
  description: z.string().trim().max(2000).optional(),
  outcome: z.string().trim().max(1000).optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  nextAction: z.string().trim().max(500).optional(),
  nextActionDate: z.string().datetime().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

// ─── Note ─────────────────────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  content: nonEmptyString.max(10000),
  isPinned: z.boolean().default(false),
  visibility: z.enum(['internal', 'public']).default('internal'),
  tags: z.array(z.string().trim().max(50)).max(10).default([]),
});

export const updateNoteSchema = createNoteSchema.partial();

// ─── Task ─────────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: nonEmptyString.max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  dueDate: z.string().datetime().optional(),
  checklist: z
    .array(z.object({ id: z.string(), text: z.string().min(1), completed: z.boolean() }))
    .default([]),
  labels: z.array(z.string().trim().max(50)).max(10).default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

// ─── Follow-up ────────────────────────────────────────────────────────────────

export const createFollowUpSchema = z.object({
  contactId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  type: z.enum(['call', 'email', 'meeting', 'whatsapp', 'visit', 'other']).default('call'),
  notes: z.string().trim().max(1000).optional(),
  scheduledAt: z.string().datetime(),
  reminderAt: z.string().datetime().optional(),
  status: z.enum(['pending', 'completed', 'cancelled', 'overdue']).default('pending'),
});

export const updateFollowUpSchema = createFollowUpSchema.partial();

// ─── Global search ────────────────────────────────────────────────────────────

export const globalSearchSchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const timelineQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  types: z.string().optional(),
  search: z.string().trim().optional(),
});

// Types
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
