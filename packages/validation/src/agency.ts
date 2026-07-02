import { z } from 'zod';

import { emailSchema, nonEmptyString, phoneSchema, urlSchema } from './common';

export const agencyAddressSchema = z.object({
  street: z.string().trim().max(200).optional(),
  city: nonEmptyString.max(100),
  state: nonEmptyString.max(100),
  country: nonEmptyString.max(100),
  postalCode: z.string().trim().max(20).optional(),
  googleMapsUrl: urlSchema.optional(),
});

export const createAgencySchema = z.object({
  name: nonEmptyString.max(200),
  legalName: z.string().trim().max(200).optional(),
  ownerName: nonEmptyString.max(100),
  primaryContactName: z.string().trim().max(100).optional(),
  email: emailSchema,
  secondaryEmail: emailSchema.optional(),
  phone: phoneSchema,
  secondaryPhone: phoneSchema.optional(),
  whatsapp: phoneSchema.optional(),
  website: urlSchema.optional(),
  address: agencyAddressSchema,
  gstNumber: z.string().trim().max(20).optional(),
  panNumber: z.string().trim().max(15).optional(),
  yearEstablished: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.enum(['1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '250+']).optional(),
  notes: z.string().trim().max(2000).optional(),
  services: z.array(z.string().trim().max(100)).max(50).default([]),
  destinations: z.array(z.string().trim().max(100)).max(100).default([]),
  tags: z.array(z.string().trim().max(50)).max(20).default([]),
});

export const updateAgencySchema = createAgencySchema.partial();

export const agencyListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'archived', 'suspended']).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  marketplaceStatus: z.enum(['unlisted', 'listed', 'featured', 'suspended']).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  services: z.string().trim().optional(),
  destinations: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  sortBy: z
    .enum(['name', 'createdAt', 'updatedAt', 'city', 'state', 'rating'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const bulkOperationSchema = z.object({
  ids: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(100),
  action: z.enum(['delete', 'archive', 'restore', 'activate', 'deactivate']),
  value: z.string().optional(),
});

export const archiveAgencySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type CreateAgencyInput = z.infer<typeof createAgencySchema>;
export type UpdateAgencyInput = z.infer<typeof updateAgencySchema>;
export type AgencyListQueryInput = z.infer<typeof agencyListQuerySchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
