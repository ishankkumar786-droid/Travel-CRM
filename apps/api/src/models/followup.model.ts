import mongoose, { type Document, Schema } from 'mongoose';

import type { FollowUpDTO, FollowUpStatus, FollowUpType } from '@travel/types';

export interface IFollowUp extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  contactId?: mongoose.Types.ObjectId | undefined;
  assignedTo?: mongoose.Types.ObjectId | undefined;
  type: FollowUpType;
  notes?: string | undefined;
  scheduledAt: Date;
  reminderAt?: Date | undefined;
  status: FollowUpStatus;
  completedAt?: Date | undefined;
  createdBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(assignedToName?: string): FollowUpDTO;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'whatsapp', 'visit', 'other'],
      default: 'call',
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    scheduledAt: { type: Date, required: true },
    reminderAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'overdue'],
      default: 'pending',
    },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

followUpSchema.index({ agencyId: 1, status: 1 });
followUpSchema.index({ agencyId: 1, scheduledAt: 1 });
followUpSchema.index({ assignedTo: 1, status: 1, scheduledAt: 1 });
followUpSchema.index({ status: 1, scheduledAt: 1 });
followUpSchema.index({ deletedAt: 1 });

followUpSchema.pre(/^find/, function (this: mongoose.Query<unknown, IFollowUp>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

followUpSchema.methods['toDTO'] = function (assignedToName?: string): FollowUpDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    contactId:
      this.contactId !== null && this.contactId !== undefined
        ? (this.contactId as mongoose.Types.ObjectId).toString()
        : undefined,
    assignedTo:
      this.assignedTo !== null && this.assignedTo !== undefined
        ? (this.assignedTo as mongoose.Types.ObjectId).toString()
        : undefined,
    assignedToName,
    type: this.type as FollowUpType,
    notes: this.notes as string | undefined,
    scheduledAt: (this.scheduledAt as Date).toISOString(),
    reminderAt: this.reminderAt ? (this.reminderAt as Date).toISOString() : undefined,
    status: this.status as FollowUpStatus,
    completedAt: this.completedAt ? (this.completedAt as Date).toISOString() : undefined,
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', followUpSchema);
