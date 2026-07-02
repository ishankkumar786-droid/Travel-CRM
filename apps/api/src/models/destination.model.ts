import { slugify } from '@travel/utils';
import mongoose, { Schema } from 'mongoose';

import type { DestinationDTO } from '@travel/types';

export interface IDestination {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: 'country' | 'state' | 'city' | 'tourist_place';
  parentId?: mongoose.Types.ObjectId | undefined;
  countryCode?: string | undefined;
  description?: string | undefined;
  images: string[];
  coverImage?: string | undefined;
  category: string[];
  isPopular: boolean;
  isFeatured: boolean;
  seo: { title?: string; description?: string; keywords: string[] };
  coordinates?: { lat: number; lng: number } | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): DestinationDTO;
}

const destinationSchema = new Schema<IDestination>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['country', 'state', 'city', 'tourist_place'], required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Destination' },
    countryCode: { type: String, uppercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    images: [{ type: String }],
    coverImage: { type: String },
    category: [{ type: String, trim: true }],
    isPopular: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    seo: { title: String, description: String, keywords: [String] },
    coordinates: { lat: Number, lng: Number },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

destinationSchema.index({ type: 1, parentId: 1 });
// slug index is created by `unique: true` on the field definition
destinationSchema.index({ isPopular: 1, isFeatured: 1 });
destinationSchema.index({ name: 'text' });

destinationSchema.pre(/^find/, function (this: mongoose.Query<unknown, IDestination>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

destinationSchema.methods['toDTO'] = function (): DestinationDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    name: this.name as string,
    slug: this.slug as string,
    type: this.type as DestinationDTO['type'],
    parentId: this.parentId ? (this.parentId as mongoose.Types.ObjectId).toString() : undefined,
    countryCode: this.countryCode as string | undefined,
    description: this.description as string | undefined,
    images: this.images as string[],
    coverImage: this.coverImage as string | undefined,
    category: this.category as string[],
    isPopular: this.isPopular as boolean,
    isFeatured: this.isFeatured as boolean,
    seo: this.seo as DestinationDTO['seo'],
    coordinates: this.coordinates as { lat: number; lng: number } | undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Destination = mongoose.model<IDestination>('Destination', destinationSchema);
export function generateDestinationSlug(name: string): string {
  return slugify(name);
}
