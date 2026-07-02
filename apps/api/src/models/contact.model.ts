import mongoose, { type Document, Schema } from 'mongoose';

import type { ContactDTO, ContactStatus, PreferredCommunication } from '@travel/types';

export interface IContact extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  designation?: string | undefined;
  department?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  whatsapp?: string | undefined;
  linkedin?: string | undefined;
  preferredCommunication: PreferredCommunication;
  isPrimary: boolean;
  notes?: string | undefined;
  status: ContactStatus;
  createdBy?: mongoose.Types.ObjectId | undefined;
  updatedBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ContactDTO;
}

const contactSchema = new Schema<IContact>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    designation: { type: String, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 100 },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    preferredCommunication: {
      type: String,
      enum: ['email', 'phone', 'whatsapp', 'in_person'],
      default: 'email',
    },
    isPrimary: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

contactSchema.index({ agencyId: 1, status: 1 });
contactSchema.index({ agencyId: 1, isPrimary: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ deletedAt: 1 });

contactSchema.pre(/^find/, function (this: mongoose.Query<unknown, IContact>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

contactSchema.methods['toDTO'] = function (): ContactDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    firstName: this.firstName as string,
    lastName: this.lastName as string,
    fullName: `${this.firstName as string} ${this.lastName as string}`,
    designation: this.designation as string | undefined,
    department: this.department as string | undefined,
    email: this.email as string | undefined,
    phone: this.phone as string | undefined,
    whatsapp: this.whatsapp as string | undefined,
    linkedin: this.linkedin as string | undefined,
    preferredCommunication: this.preferredCommunication as PreferredCommunication,
    isPrimary: this.isPrimary as boolean,
    notes: this.notes as string | undefined,
    status: this.status as ContactStatus,
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
