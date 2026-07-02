import { slugify } from '@travel/utils';
import mongoose, { Schema } from 'mongoose';

import type { ServiceCatalogItem } from '@travel/types';

export interface ICatalogItem {
  _id: mongoose.Types.ObjectId;
  catalogType: ServiceCatalogItem['catalogType'];
  name: string;
  slug: string;
  icon?: string | undefined;
  description?: string | undefined;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ServiceCatalogItem;
}

const catalogSchema = new Schema<ICatalogItem>(
  {
    catalogType: {
      type: String,
      enum: [
        'package_type',
        'travel_style',
        'amenity',
        'activity',
        'transport',
        'accommodation',
        'meal_plan',
        'tag',
      ],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, lowercase: true, trim: true },
    icon: { type: String },
    description: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

catalogSchema.index({ catalogType: 1, isActive: 1, sortOrder: 1 });
catalogSchema.index({ slug: 1 });

catalogSchema.methods['toDTO'] = function (): ServiceCatalogItem {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    catalogType: this.catalogType as ServiceCatalogItem['catalogType'],
    name: this.name as string,
    slug: this.slug as string,
    icon: this.icon as string | undefined,
    description: this.description as string | undefined,
    isActive: this.isActive as boolean,
    sortOrder: this.sortOrder as number,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const CatalogItem = mongoose.model<ICatalogItem>('CatalogItem', catalogSchema);
export function generateCatalogSlug(name: string): string {
  return slugify(name);
}
