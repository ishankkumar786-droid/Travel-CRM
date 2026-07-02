import { z } from 'zod';

import { nonEmptyString } from './common';

// ─── Verification ─────────────────────────────────────────────────────────────

export const verificationStageSchema = z.enum([
  'pending',
  'researching',
  'documents_requested',
  'documents_received',
  'under_review',
  'verified',
  'rejected',
  'expired',
]);

export const updateVerificationStageSchema = z.object({
  stage: verificationStageSchema,
  remarks: z.string().trim().max(1000).optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const verifyFieldSchema = z.object({
  field: z.enum(['email', 'phone', 'website', 'gst', 'pan', 'govtReg', 'association']),
  status: z.enum(['verified', 'failed', 'pending']),
  remarks: z.string().trim().max(500).optional(),
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const documentTypeSchema = z.enum([
  'gst',
  'pan',
  'trade_license',
  'company_registration',
  'iata',
  'ministry_registration',
  'brochure',
  'price_list',
  'other',
]);

export const uploadDocumentSchema = z.object({
  type: documentTypeSchema,
  expiryDate: z.string().datetime().optional(),
  remarks: z.string().trim().max(500).optional(),
});

export const updateDocumentSchema = z.object({
  status: z.enum(['pending', 'verified', 'rejected', 'expired']).optional(),
  expiryDate: z.string().datetime().optional(),
  remarks: z.string().trim().max(500).optional(),
});

// ─── Import ───────────────────────────────────────────────────────────────────

export const importJobSchema = z.object({
  name: nonEmptyString.max(100),
  format: z.enum(['csv', 'xlsx', 'json']),
  conflictStrategy: z.enum(['skip', 'merge', 'overwrite']).default('skip'),
});

// ─── User Management ──────────────────────────────────────────────────────────

export const inviteUserSchema = z.object({
  firstName: nonEmptyString.max(50),
  lastName: nonEmptyString.max(50),
  email: z.string().email(),
  role: z.enum(['admin', 'researcher', 'sales', 'verification', 'support', 'viewer']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'researcher', 'sales', 'verification', 'support', 'viewer']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
});

// ─── Settings ─────────────────────────────────────────────────────────────────

export const systemSettingsSchema = z.object({
  general: z
    .object({
      companyName: z.string().trim().max(100).optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  verification: z
    .object({
      autoAssign: z.boolean().optional(),
      defaultAssignee: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional(),
      requireDocuments: z.boolean().optional(),
      minScore: z.coerce.number().min(0).max(100).optional(),
    })
    .optional(),
  import: z
    .object({
      maxFileSizeMb: z.coerce.number().min(1).max(100).optional(),
      defaultConflictStrategy: z.enum(['skip', 'merge', 'overwrite']).optional(),
    })
    .optional(),
});

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
});

// ─── Audit log filter ─────────────────────────────────────────────────────────

export const auditLogFilterSchema = z.object({
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  action: z.string().optional(),
  who: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type UpdateVerificationStageInput = z.infer<typeof updateVerificationStageSchema>;
export type VerifyFieldInput = z.infer<typeof verifyFieldSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ImportJobInput = z.infer<typeof importJobSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
