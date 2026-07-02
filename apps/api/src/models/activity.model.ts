import mongoose, { type Document, Schema } from 'mongoose';

import type { ActivityDTO, ActivityType } from '@travel/types';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  contactId?: mongoose.Types.ObjectId | undefined;
  type: ActivityType;
  title: string;
  description?: string | undefined;
  outcome?: string | undefined;
  durationMinutes?: number | undefined;
  nextAction?: string | undefined;
  nextActionDate?: Date | undefined;
  createdBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(createdByName?: string): ActivityDTO;
}

const activitySchema = new Schema<IActivity>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    type: {
      type: String,
      enum: ['call', 'meeting', 'email', 'whatsapp', 'visit', 'demo', 'video_call', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    outcome: { type: String, trim: true, maxlength: 1000 },
    durationMinutes: { type: Number, min: 1 },
    nextAction: { type: String, trim: true, maxlength: 500 },
    nextActionDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

activitySchema.index({ agencyId: 1, createdAt: -1 });
activitySchema.index({ agencyId: 1, type: 1 });
activitySchema.index({ createdBy: 1 });
activitySchema.index({ deletedAt: 1 });

activitySchema.pre(/^find/, function (this: mongoose.Query<unknown, IActivity>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

activitySchema.methods['toDTO'] = function (createdByName?: string): ActivityDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    contactId:
      this.contactId !== null && this.contactId !== undefined
        ? (this.contactId as mongoose.Types.ObjectId).toString()
        : undefined,
    type: this.type as ActivityType,
    title: this.title as string,
    description: this.description as string | undefined,
    outcome: this.outcome as string | undefined,
    durationMinutes: this.durationMinutes as number | undefined,
    nextAction: this.nextAction as string | undefined,
    nextActionDate: this.nextActionDate ? (this.nextActionDate as Date).toISOString() : undefined,
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdByName,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
