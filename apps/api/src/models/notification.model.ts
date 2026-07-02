import mongoose, { type Document, Schema } from 'mongoose';

import type { NotificationDTO, NotificationType } from '@travel/types';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string | undefined;
  resourceType?: string | undefined;
  resourceId?: mongoose.Types.ObjectId | undefined;
  isRead: boolean;
  readAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): NotificationDTO;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['task_assigned', 'followup_due', 'task_due', 'agency_updated', 'mention', 'system'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, maxlength: 500 },
    resourceType: { type: String },
    resourceId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.methods['toDTO'] = function (): NotificationDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    userId: (this.userId as mongoose.Types.ObjectId).toString(),
    type: this.type as NotificationType,
    title: this.title as string,
    body: this.body as string | undefined,
    resourceType: this.resourceType as string | undefined,
    resourceId:
      this.resourceId !== null && this.resourceId !== undefined
        ? (this.resourceId as mongoose.Types.ObjectId).toString()
        : undefined,
    isRead: this.isRead as boolean,
    readAt: this.readAt ? (this.readAt as Date).toISOString() : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
