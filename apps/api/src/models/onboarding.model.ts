import mongoose, { Schema } from 'mongoose';

import type { OnboardingDTO, OnboardingStage } from '@travel/types';

export interface IOnboarding {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  stage: OnboardingStage;
  assignedReviewer?: mongoose.Types.ObjectId | undefined;
  checklist: {
    profileComplete: boolean;
    documentsSubmitted: boolean;
    verificationPassed: boolean;
    packagesAdded: boolean;
    bankDetailsAdded: boolean;
  };
  history: Array<{
    stage: OnboardingStage;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    remarks?: string | undefined;
  }>;
  marketplaceEligible: boolean;
  eligibilityReasons: string[];
  createdAt: Date;
  updatedAt: Date;
  toDTO(): OnboardingDTO;
}

const onboardingSchema = new Schema<IOnboarding>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, unique: true },
    stage: {
      type: String,
      enum: [
        'invited',
        'applied',
        'documents_submitted',
        'verification_pending',
        'verified',
        'marketplace_approved',
        'live',
        'suspended',
        'rejected',
      ],
      default: 'invited',
    },
    assignedReviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    checklist: {
      profileComplete: { type: Boolean, default: false },
      documentsSubmitted: { type: Boolean, default: false },
      verificationPassed: { type: Boolean, default: false },
      packagesAdded: { type: Boolean, default: false },
      bankDetailsAdded: { type: Boolean, default: false },
    },
    history: [
      {
        stage: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        changedAt: { type: Date, default: () => new Date() },
        remarks: { type: String },
        _id: false,
      },
    ],
    marketplaceEligible: { type: Boolean, default: false },
    eligibilityReasons: [{ type: String }],
  },
  { timestamps: true },
);

// agencyId index is created by `unique: true` on the field definition
onboardingSchema.index({ stage: 1 });
onboardingSchema.index({ assignedReviewer: 1, stage: 1 });

onboardingSchema.methods['toDTO'] = function (): OnboardingDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    stage: this.stage as OnboardingStage,
    assignedReviewer: this.assignedReviewer
      ? (this.assignedReviewer as mongoose.Types.ObjectId).toString()
      : undefined,
    checklist: this.checklist as OnboardingDTO['checklist'],
    history: (this.history as IOnboarding['history']).map((h) => ({
      stage: h.stage,
      changedBy: h.changedBy.toString(),
      changedAt: h.changedAt.toISOString(),
      remarks: h.remarks,
    })),
    marketplaceEligible: this.marketplaceEligible as boolean,
    eligibilityReasons: this.eligibilityReasons as string[],
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Onboarding = mongoose.model<any>('Onboarding', onboardingSchema);
