import mongoose, { type Document, Schema } from 'mongoose';

import type { SystemSettings } from '@travel/types';

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  general: SystemSettings['general'];
  verification: SystemSettings['verification'];
  import: SystemSettings['import'];
  notifications: SystemSettings['notifications'];
  updatedBy?: mongoose.Types.ObjectId | undefined;
  updatedAt: Date;
  createdAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    general: {
      companyName: { type: String, default: 'Travel Marketplace' },
      timezone: { type: String, default: 'UTC' },
      dateFormat: { type: String, default: 'yyyy-MM-dd' },
      currency: { type: String, default: 'USD' },
    },
    verification: {
      autoAssign: { type: Boolean, default: false },
      defaultAssignee: { type: Schema.Types.ObjectId, ref: 'User' },
      requireDocuments: { type: Boolean, default: true },
      minScore: { type: Number, default: 70 },
    },
    import: {
      maxFileSizeMb: { type: Number, default: 10 },
      allowedFormats: { type: [String], default: ['csv', 'xlsx', 'json'] },
      defaultConflictStrategy: { type: String, default: 'skip' },
    },
    notifications: {
      taskDueReminderHours: { type: Number, default: 24 },
      followupReminderHours: { type: Number, default: 2 },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export async function getOrCreateSettings(): Promise<ISettings> {
  let s = await Settings.findOne().exec();
  if (!s) s = await Settings.create({});
  return s;
}
