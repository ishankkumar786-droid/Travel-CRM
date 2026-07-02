import { slugify } from '@travel/utils';
import mongoose, { Schema } from 'mongoose';

import type { PackageDTO, PackageDifficulty, PackageStatus } from '@travel/types';

export interface IPackage {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  destinationId?: mongoose.Types.ObjectId | undefined;
  destinationName?: string | undefined;
  category: string;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  currency: string;
  season?: string | undefined;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  terms?: string | undefined;
  gallery: string[];
  coverImage?: string | undefined;
  hotelCategory?: string | undefined;
  meals?: string | undefined;
  transport?: string | undefined;
  difficulty: PackageDifficulty;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  minGroupSize?: number | undefined;
  maxGroupSize?: number | undefined;
  status: PackageStatus;
  isFeatured: boolean;
  version: number;
  seo: { title?: string; description?: string; keywords: string[] };
  createdBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): PackageDTO;
}

const packageSchema = new Schema<IPackage>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination' },
    destinationName: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true, min: 1 },
    durationNights: { type: Number, required: true, min: 0 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    season: { type: String, trim: true },
    highlights: [{ type: String, trim: true }],
    inclusions: [{ type: String, trim: true }],
    exclusions: [{ type: String, trim: true }],
    terms: { type: String, trim: true },
    gallery: [{ type: String }],
    coverImage: { type: String },
    hotelCategory: { type: String, trim: true },
    meals: { type: String, trim: true },
    transport: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'extreme'],
      default: 'easy',
    },
    minAge: { type: Number, min: 0 },
    maxAge: { type: Number, min: 0 },
    minGroupSize: { type: Number, min: 1 },
    maxGroupSize: { type: Number, min: 1 },
    status: { type: String, enum: ['draft', 'active', 'inactive', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

packageSchema.index({ agencyId: 1, status: 1 });
packageSchema.index({ slug: 1 });
packageSchema.index({ destinationId: 1 });
packageSchema.index({ category: 1, status: 1 });
packageSchema.index({ pricePerPerson: 1 });
packageSchema.index({ isFeatured: 1, status: 1 });
packageSchema.index({ deletedAt: 1 });
packageSchema.index(
  { name: 'text', destinationName: 'text', category: 'text' },
  { weights: { name: 10, destinationName: 5, category: 3 } },
);

packageSchema.pre(/^find/, function (this: mongoose.Query<unknown, IPackage>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

packageSchema.methods['toDTO'] = function (): PackageDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    name: this.name as string,
    slug: this.slug as string,
    destinationId: this.destinationId
      ? (this.destinationId as mongoose.Types.ObjectId).toString()
      : undefined,
    destinationName: this.destinationName as string | undefined,
    category: this.category as string,
    durationDays: this.durationDays as number,
    durationNights: this.durationNights as number,
    pricePerPerson: this.pricePerPerson as number,
    currency: this.currency as string,
    season: this.season as string | undefined,
    highlights: this.highlights as string[],
    inclusions: this.inclusions as string[],
    exclusions: this.exclusions as string[],
    terms: this.terms as string | undefined,
    gallery: this.gallery as string[],
    coverImage: this.coverImage as string | undefined,
    hotelCategory: this.hotelCategory as string | undefined,
    meals: this.meals as string | undefined,
    transport: this.transport as string | undefined,
    difficulty: this.difficulty as PackageDifficulty,
    minAge: this.minAge as number | undefined,
    maxAge: this.maxAge as number | undefined,
    minGroupSize: this.minGroupSize as number | undefined,
    maxGroupSize: this.maxGroupSize as number | undefined,
    status: this.status as PackageStatus,
    isFeatured: this.isFeatured as boolean,
    version: this.version as number,
    seo: this.seo as PackageDTO['seo'],
    createdBy: this.createdBy ? (this.createdBy as mongoose.Types.ObjectId).toString() : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Package = mongoose.model<IPackage>('Package', packageSchema);

export async function generatePackageSlug(name: string, agencyId: string): Promise<string> {
  const base = slugify(name);
  const count = await Package.countDocuments({ agencyId }).exec();
  return `${base}-${count + 1}`;
}
