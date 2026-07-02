import mongoose, { type Document, Schema } from 'mongoose';

import type { DocumentDTO, DocumentStatus, DocumentType } from '@travel/types';

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  type: DocumentType;
  name: string;
  originalName: string;
  url: string;
  publicId?: string | undefined;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  version: number;
  expiryDate?: Date | undefined;
  remarks?: string | undefined;
  uploadedBy?: mongoose.Types.ObjectId | undefined;
  verifiedBy?: mongoose.Types.ObjectId | undefined;
  verifiedAt?: Date | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): DocumentDTO;
}

const documentSchema = new Schema<IDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    type: {
      type: String,
      enum: [
        'gst',
        'pan',
        'trade_license',
        'company_registration',
        'iata',
        'ministry_registration',
        'brochure',
        'price_list',
        'other',
      ],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending',
    },
    version: { type: Number, default: 1 },
    expiryDate: { type: Date },
    remarks: { type: String, trim: true, maxlength: 500 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

documentSchema.index({ agencyId: 1, type: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ deletedAt: 1 });

documentSchema.pre(/^find/, function (this: mongoose.Query<unknown, IDocument>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

documentSchema.methods['toDTO'] = function (): DocumentDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    type: this.type as DocumentType,
    name: this.name as string,
    originalName: this.originalName as string,
    url: this.url as string,
    publicId: this.publicId as string | undefined,
    mimeType: this.mimeType as string,
    sizeBytes: this.sizeBytes as number,
    status: this.status as DocumentStatus,
    version: this.version as number,
    expiryDate: this.expiryDate ? (this.expiryDate as Date).toISOString() : undefined,
    remarks: this.remarks as string | undefined,
    uploadedBy: this.uploadedBy
      ? (this.uploadedBy as mongoose.Types.ObjectId).toString()
      : undefined,
    verifiedBy: this.verifiedBy
      ? (this.verifiedBy as mongoose.Types.ObjectId).toString()
      : undefined,
    verifiedAt: this.verifiedAt ? (this.verifiedAt as Date).toISOString() : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const AgencyDocument = mongoose.model<IDocument>('AgencyDocument', documentSchema);
