import { z } from 'zod';

import { nonEmptyString, urlSchema } from './common';

export const updateOnboardingStageSchema = z.object({
  stage: z.enum([
    'invited',
    'applied',
    'documents_submitted',
    'verification_pending',
    'verified',
    'marketplace_approved',
    'live',
    'suspended',
    'rejected',
  ]),
  remarks: z.string().trim().max(500).optional(),
  assignedReviewer: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const updateMarketplaceProfileSchema = z.object({
  description: z.string().trim().max(5000).optional(),
  languages: z.array(z.string().trim()).optional(),
  awards: z.array(z.string().trim()).optional(),
  certifications: z.array(z.string().trim()).optional(),
  specializations: z.array(z.string().trim()).optional(),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  socialLinks: z
    .object({
      facebook: urlSchema.optional(),
      instagram: urlSchema.optional(),
      twitter: urlSchema.optional(),
      linkedin: urlSchema.optional(),
      youtube: urlSchema.optional(),
      website: urlSchema.optional(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().trim().max(70).optional(),
      description: z.string().trim().max(160).optional(),
      keywords: z.array(z.string().trim()).max(20).optional(),
      ogTitle: z.string().trim().max(70).optional(),
      ogDescription: z.string().trim().max(200).optional(),
    })
    .optional(),
  isPublic: z.boolean().optional(),
});

export const createPackageSchema = z.object({
  name: nonEmptyString.max(200),
  destinationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  destinationName: z.string().trim().max(100).optional(),
  category: nonEmptyString.max(100),
  durationDays: z.coerce.number().int().positive(),
  durationNights: z.coerce.number().int().nonnegative(),
  pricePerPerson: z.coerce.number().positive(),
  currency: z.string().default('USD'),
  season: z.string().trim().optional(),
  highlights: z.array(z.string().trim()).max(20).default([]),
  inclusions: z.array(z.string().trim()).max(50).default([]),
  exclusions: z.array(z.string().trim()).max(50).default([]),
  terms: z.string().trim().max(5000).optional(),
  gallery: z.array(z.string().url()).max(20).default([]),
  coverImage: z.string().url().optional(),
  itinerary: z
    .array(
      z.object({
        day: z.coerce.number().int().positive(),
        title: z.string().trim().max(200),
        description: z.string().trim().max(2000),
      })
    )
    .optional(),
  hotelCategory: z.string().trim().optional(),
  meals: z.string().trim().optional(),
  transport: z.string().trim().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'extreme']).default('easy'),
  minAge: z.coerce.number().int().nonnegative().optional(),
  maxAge: z.coerce.number().int().positive().optional(),
  minGroupSize: z.coerce.number().int().positive().optional(),
  maxGroupSize: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  seo: z
    .object({
      title: z.string().trim().max(70).optional(),
      description: z.string().trim().max(160).optional(),
      keywords: z.array(z.string().trim()).max(20).default([]),
    })
    .optional(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const createDestinationSchema = z.object({
  name: nonEmptyString.max(100),
  type: z.enum(['country', 'state', 'city', 'tourist_place']),
  parentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  countryCode: z.string().length(2).optional(),
  description: z.string().trim().max(2000).optional(),
  images: z.array(z.string().url()).max(10).default([]),
  coverImage: z.string().url().optional(),
  category: z.array(z.string().trim()).max(10).default([]),
  isPopular: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seo: z
    .object({
      title: z.string().trim().max(70).optional(),
      description: z.string().trim().max(160).optional(),
      keywords: z.array(z.string().trim()).max(20).default([]),
    })
    .optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const createCatalogItemSchema = z.object({
  catalogType: z.enum([
    'package_type',
    'travel_style',
    'amenity',
    'activity',
    'transport',
    'accommodation',
    'meal_plan',
    'tag',
  ]),
  name: nonEmptyString.max(100),
  icon: z.string().trim().optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export const marketplaceSearchSchema = z.object({
  q: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().positive().optional(),
  minDays: z.coerce.number().int().positive().optional(),
  maxDays: z.coerce.number().int().positive().optional(),
  category: z.string().trim().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verified: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  featured: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z
    .enum(['featured', 'trending', 'rating', 'price_asc', 'price_desc', 'newest'])
    .default('featured'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type UpdateOnboardingStageInput = z.infer<typeof updateOnboardingStageSchema>;
export type UpdateMarketplaceProfileInput = z.infer<typeof updateMarketplaceProfileSchema>;
export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
export type MarketplaceSearchInput = z.infer<typeof marketplaceSearchSchema>;
