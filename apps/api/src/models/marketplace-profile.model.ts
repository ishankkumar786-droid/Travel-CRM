import { slugify } from '@travel/utils';
import mongoose, { Schema } from 'mongoose';

import type { MarketplaceProfileDTO } from '@travel/types';

export interface IMarketplaceProfile {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  publicSlug: string;
  description?: string | undefined;
  logoUrl?: string | undefined;
  bannerUrl?: string | undefined;
  gallery: string[];
  socialLinks: Record<string, string | undefined>;
  businessHours: Array<{ day: string; open: string; close: string; isOpen: boolean }>;
  languages: string[];
  awards: string[];
  certifications: string[];
  yearsExperience?: number | undefined;
  specializations: string[];
  verificationScore: number;
  profileScore: number;
  trustScore: number;
  marketplaceScore: number;
  readinessPercent: number;
  missingInfo: string[];
  seo: Record<string, unknown>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): MarketplaceProfileDTO;
}

const mpSchema = new Schema<IMarketplaceProfile>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, unique: true },
    publicSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 5000 },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    gallery: [{ type: String }],
    socialLinks: { type: Schema.Types.Mixed, default: {} },
    businessHours: { type: Schema.Types.Mixed, default: [] },
    languages: [{ type: String, trim: true }],
    awards: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    yearsExperience: { type: Number, min: 0 },
    specializations: [{ type: String, trim: true }],
    verificationScore: { type: Number, default: 0 },
    profileScore: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 },
    marketplaceScore: { type: Number, default: 0 },
    readinessPercent: { type: Number, default: 0 },
    missingInfo: [{ type: String }],
    seo: { type: Schema.Types.Mixed, default: { keywords: [] } },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// agencyId index is created by `unique: true` on the field definition
// publicSlug index is created by `unique: true` on the field definition
mpSchema.index({ isPublic: 1, marketplaceScore: -1 });

mpSchema.methods['toDTO'] = function (): MarketplaceProfileDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    publicSlug: this.publicSlug as string,
    description: this.description as string | undefined,
    logoUrl: this.logoUrl as string | undefined,
    bannerUrl: this.bannerUrl as string | undefined,
    gallery: this.gallery as string[],
    socialLinks: this.socialLinks as MarketplaceProfileDTO['socialLinks'],
    businessHours: this.businessHours as MarketplaceProfileDTO['businessHours'],
    languages: this.languages as string[],
    awards: this.awards as string[],
    certifications: this.certifications as string[],
    yearsExperience: this.yearsExperience as number | undefined,
    specializations: this.specializations as string[],
    verificationScore: this.verificationScore as number,
    profileScore: this.profileScore as number,
    trustScore: this.trustScore as number,
    marketplaceScore: this.marketplaceScore as number,
    readinessPercent: this.readinessPercent as number,
    missingInfo: this.missingInfo as string[],
    seo: this.seo as MarketplaceProfileDTO['seo'],
    isPublic: this.isPublic as boolean,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MarketplaceProfile = mongoose.model<any>('MarketplaceProfile', mpSchema);

export function generatePublicSlug(agencyName: string, agencyCode: string): string {
  return `${slugify(agencyName)}-${agencyCode.toLowerCase()}`;
}
