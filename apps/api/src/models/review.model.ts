import mongoose, { type Document, Schema } from 'mongoose';
import type { ReviewDTO, ReviewStatus } from '@travel/types';
import { randomUUID } from 'crypto';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  packageId?: mongoose.Types.ObjectId | undefined;
  travelerName: string;
  travelerEmail: string;
  rating: number;
  content?: string | undefined;
  status: ReviewStatus;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ReviewDTO;
}

const reviewSchema = new Schema<IReview>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package' },
    travelerName: { type: String, required: true, trim: true, maxlength: 100 },
    travelerEmail: { type: String, required: true, lowercase: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 }, // 0 when pending
    content: { type: String, trim: true, maxlength: 5000 },
    status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
    token: { type: String, required: true, unique: true, default: () => randomUUID() },
  },
  { timestamps: true },
);

reviewSchema.index({ agencyId: 1, status: 1 });
reviewSchema.index({ token: 1 });

reviewSchema.methods['toDTO'] = function (): ReviewDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    packageId: this.packageId ? (this.packageId as mongoose.Types.ObjectId).toString() : undefined,
    travelerName: this.travelerName as string,
    travelerEmail: this.travelerEmail as string,
    rating: this.rating as number,
    content: this.content as string | undefined,
    status: this.status as ReviewStatus,
    token: this.token as string,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Review = mongoose.model<IReview>('Review', reviewSchema);
