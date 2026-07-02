import { slugify } from '@travel/utils';
import mongoose, { type Document, Schema } from 'mongoose';

import type {
  AgencyAddress,
  AgencyDTO,
  AgencyListItem,
  AgencyStatus,
  EmployeeCount,
  MarketplaceStatus,
  VerificationStatus,
} from '@travel/types';

export interface IAgency extends Document {
  _id: mongoose.Types.ObjectId;
  agencyCode: string;
  slug: string;
  name: string;
  legalName?: string | undefined;
  ownerName: string;
  primaryContactName?: string | undefined;
  email: string;
  secondaryEmail?: string | undefined;
  phone: string;
  secondaryPhone?: string | undefined;
  whatsapp?: string | undefined;
  website?: string | undefined;
  address: AgencyAddress;
  gstNumber?: string | undefined;
  panNumber?: string | undefined;
  yearEstablished?: number | undefined;
  employeeCount?: EmployeeCount | undefined;
  status: AgencyStatus;
  verificationStatus: VerificationStatus;
  marketplaceStatus: MarketplaceStatus;
  rating?: number | undefined;
  notes?: string | undefined;
  services: string[];
  destinations: string[];
  tags: string[];
  profileCompletion: number;
  createdBy?: mongoose.Types.ObjectId | undefined;
  updatedBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  toDTO(): AgencyDTO;
  toListItem(): AgencyListItem;
  computeProfileCompletion(): number;
}

const addressSchema = new Schema<AgencyAddress>(
  {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
    googleMapsUrl: { type: String },
  },
  { _id: false },
);

const agencySchema = new Schema<IAgency>(
  {
    agencyCode: { type: String, required: true, uppercase: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    legalName: { type: String, trim: true, maxlength: 200 },
    ownerName: { type: String, required: true, trim: true, maxlength: 100 },
    primaryContactName: { type: String, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 255 },
    secondaryEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    secondaryPhone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: addressSchema, required: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    panNumber: { type: String, trim: true, uppercase: true },
    yearEstablished: { type: Number, min: 1800 },
    employeeCount: {
      type: String,
      enum: ['1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '250+'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'archived', 'suspended'],
      default: 'pending',
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
    },
    marketplaceStatus: {
      type: String,
      enum: ['unlisted', 'listed', 'featured', 'suspended'],
      default: 'unlisted',
    },
    rating: { type: Number, min: 0, max: 5 },
    notes: { type: String, trim: true, maxlength: 2000 },
    services: [{ type: String, trim: true }],
    destinations: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true, lowercase: true }],
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
agencySchema.index({ agencyCode: 1 }, { unique: true });
agencySchema.index({ slug: 1 }, { unique: true });
agencySchema.index({ email: 1 });
agencySchema.index({ status: 1, verificationStatus: 1, marketplaceStatus: 1 });
agencySchema.index({ 'address.city': 1, 'address.state': 1, 'address.country': 1 });
agencySchema.index({ tags: 1 });
agencySchema.index({ services: 1 });
agencySchema.index({ destinations: 1 });
agencySchema.index({ createdAt: -1 });
agencySchema.index({ deletedAt: 1 });
// Text index for full-text search
agencySchema.index(
  {
    name: 'text',
    ownerName: 'text',
    email: 'text',
    'address.city': 'text',
    'address.state': 'text',
    agencyCode: 'text',
  },
  { weights: { name: 10, agencyCode: 8, ownerName: 5, email: 3 } },
);

// ─── Soft-delete filter ───────────────────────────────────────────────────────
agencySchema.pre(/^find/, function (this: mongoose.Query<unknown, IAgency>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

// ─── Profile completion calculation ──────────────────────────────────────────
agencySchema.methods['computeProfileCompletion'] = function (): number {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const addr = this.address as AgencyAddress | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const services = this.services as string[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const destinations = this.destinations as string[] | undefined;

  const weights: Array<[boolean, number]> = [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.name as string), 10],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.ownerName as string), 10],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.email as string), 10],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.phone as string), 10],
    [!!addr?.city, 5],
    [!!addr?.state, 5],
    [!!addr?.country, 5],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.website as string), 5],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.legalName as string), 5],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.gstNumber as string), 5],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.panNumber as string), 5],
    [(services?.length ?? 0) > 0, 10],
    [(destinations?.length ?? 0) > 0, 10],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    [!!(this.yearEstablished as number), 5],
  ];
  return weights.reduce((sum, [has, weight]) => sum + (has ? weight : 0), 0);
};

// ─── toDTO ────────────────────────────────────────────────────────────────────
agencySchema.methods['toDTO'] = function (): AgencyDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyCode: this.agencyCode as string,
    slug: this.slug as string,
    name: this.name as string,
    legalName: this.legalName as string | undefined,
    ownerName: this.ownerName as string,
    primaryContactName: this.primaryContactName as string | undefined,
    email: this.email as string,
    secondaryEmail: this.secondaryEmail as string | undefined,
    phone: this.phone as string,
    secondaryPhone: this.secondaryPhone as string | undefined,
    whatsapp: this.whatsapp as string | undefined,
    website: this.website as string | undefined,
    address: this.address as AgencyAddress,
    gstNumber: this.gstNumber as string | undefined,
    panNumber: this.panNumber as string | undefined,
    yearEstablished: this.yearEstablished as number | undefined,
    employeeCount: this.employeeCount as EmployeeCount | undefined,
    status: this.status as AgencyStatus,
    verificationStatus: this.verificationStatus as VerificationStatus,
    marketplaceStatus: this.marketplaceStatus as MarketplaceStatus,
    rating: this.rating as number | undefined,
    notes: this.notes as string | undefined,
    services: this.services as string[],
    destinations: this.destinations as string[],
    tags: this.tags as string[],
    profileCompletion: this.profileCompletion as number,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    updatedBy:
      this.updatedBy !== null && this.updatedBy !== undefined
        ? (this.updatedBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

// ─── toListItem ───────────────────────────────────────────────────────────────
agencySchema.methods['toListItem'] = function (): AgencyListItem {
  const addr = this.address as AgencyAddress | undefined;
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyCode: this.agencyCode as string,
    slug: this.slug as string,
    name: this.name as string,
    ownerName: this.ownerName as string,
    email: this.email as string,
    phone: this.phone as string,
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    country: addr?.country ?? '',
    status: this.status as AgencyStatus,
    verificationStatus: this.verificationStatus as VerificationStatus,
    marketplaceStatus: this.marketplaceStatus as MarketplaceStatus,
    rating: this.rating as number | undefined,
    tags: this.tags as string[],
    services: this.services as string[],
    profileCompletion: this.profileCompletion as number,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Agency = mongoose.model<IAgency>('Agency', agencySchema);

// ─── Agency code generator ────────────────────────────────────────────────────
export async function generateAgencyCode(): Promise<string> {
  const count = await Agency.countDocuments().exec();
  const padded = String(count + 1).padStart(5, '0');
  return `AGY${padded}`;
}

export function generateAgencySlug(name: string, code: string): string {
  return `${slugify(name)}-${code.toLowerCase()}`;
}
