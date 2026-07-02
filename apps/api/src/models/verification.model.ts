import mongoose, { type Document, Schema } from 'mongoose';

import type {
  FieldVerification,
  VerificationChecklist,
  VerificationDTO,
  VerificationStage,
} from '@travel/types';

export interface IVerification extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  stage: VerificationStage;
  verificationScore: number;
  confidenceScore: number;
  assignedTo?: mongoose.Types.ObjectId | undefined;
  remarks?: string | undefined;
  checklist: VerificationChecklist;
  fields: {
    email?: FieldVerification | undefined;
    phone?: FieldVerification | undefined;
    website?: FieldVerification | undefined;
    gst?: FieldVerification | undefined;
    pan?: FieldVerification | undefined;
    govtReg?: FieldVerification | undefined;
    association?: FieldVerification | undefined;
  };
  history: Array<{
    stage: VerificationStage;
    changedBy: mongoose.Types.ObjectId;
    changedByName?: string | undefined;
    changedAt: Date;
    remarks?: string | undefined;
  }>;
  createdBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): VerificationDTO;
  computeScore(): number;
}

const fieldVerificationSchema = new Schema<FieldVerification>(
  {
    status: {
      type: String,
      enum: ['unverified', 'verified', 'failed', 'pending'],
      default: 'pending',
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: String },
    remarks: { type: String },
  },
  { _id: false },
);

const historyEntrySchema = new Schema(
  {
    stage: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedByName: { type: String },
    changedAt: { type: Date, default: () => new Date() },
    remarks: { type: String },
  },
  { _id: false },
);

const verificationSchema = new Schema<IVerification>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, unique: true },
    stage: {
      type: String,
      enum: [
        'pending',
        'researching',
        'documents_requested',
        'documents_received',
        'under_review',
        'verified',
        'rejected',
        'expired',
      ],
      default: 'pending',
    },
    verificationScore: { type: Number, default: 0, min: 0, max: 100 },
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, trim: true, maxlength: 1000 },
    checklist: {
      emailVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      websiteVerified: { type: Boolean, default: false },
      gstVerified: { type: Boolean, default: false },
      panVerified: { type: Boolean, default: false },
      govtRegistrationVerified: { type: Boolean, default: false },
      associationVerified: { type: Boolean, default: false },
    },
    fields: {
      email: { type: fieldVerificationSchema },
      phone: { type: fieldVerificationSchema },
      website: { type: fieldVerificationSchema },
      gst: { type: fieldVerificationSchema },
      pan: { type: fieldVerificationSchema },
      govtReg: { type: fieldVerificationSchema },
      association: { type: fieldVerificationSchema },
    },
    history: [historyEntrySchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// agencyId index is created by `unique: true` on the field definition
verificationSchema.index({ stage: 1 });
verificationSchema.index({ assignedTo: 1, stage: 1 });

verificationSchema.methods['computeScore'] = function (): number {
  const checklist = this.checklist as VerificationChecklist;
  const weights = [
    [checklist.emailVerified, 20],
    [checklist.phoneVerified, 15],
    [checklist.gstVerified, 20],
    [checklist.panVerified, 15],
    [checklist.websiteVerified, 10],
    [checklist.govtRegistrationVerified, 15],
    [checklist.associationVerified, 5],
  ] as Array<[boolean, number]>;
  return weights.reduce((s, [v, w]) => s + (v ? w : 0), 0);
};

verificationSchema.methods['toDTO'] = function (): VerificationDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    stage: this.stage as VerificationStage,
    verificationScore: this.verificationScore as number,
    confidenceScore: this.confidenceScore as number,
    assignedTo: this.assignedTo
      ? (this.assignedTo as mongoose.Types.ObjectId).toString()
      : undefined,
    remarks: this.remarks as string | undefined,
    checklist: this.checklist as VerificationChecklist,
    fields: this.fields as VerificationDTO['fields'],
    history: (
      this.history as Array<{
        stage: VerificationStage;
        changedBy: mongoose.Types.ObjectId;
        changedByName?: string;
        changedAt: Date;
        remarks?: string;
      }>
    ).map((h) => ({
      stage: h.stage,
      changedBy: h.changedBy.toString(),
      changedByName: h.changedByName,
      changedAt: h.changedAt.toISOString(),
      remarks: h.remarks,
    })),
    createdBy: this.createdBy ? (this.createdBy as mongoose.Types.ObjectId).toString() : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Verification = mongoose.model<IVerification>('Verification', verificationSchema);
