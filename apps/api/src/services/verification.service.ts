import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { Verification } from '@/models/verification.model';

import type { VerificationDTO, VerificationStage } from '@travel/types';
import type { UpdateVerificationStageInput, VerifyFieldInput } from '@travel/validation';

class VerificationService {
  async getOrCreate(agencyId: string, userId?: string): Promise<VerificationDTO> {
    let v = await Verification.findOne({ agencyId }).exec();
    if (!v) {
      v = await Verification.create({
        agencyId,
        stage: 'pending',
        verificationScore: 0,
        confidenceScore: 0,
        checklist: {
          emailVerified: false,
          phoneVerified: false,
          websiteVerified: false,
          gstVerified: false,
          panVerified: false,
          govtRegistrationVerified: false,
          associationVerified: false,
        },
        fields: {},
        history: [],
        ...(userId && { createdBy: userId }),
      });
    }
    return v.toDTO();
  }

  async updateStage(
    agencyId: string,
    input: UpdateVerificationStageInput,
    userId: string,
    userName?: string,
  ): Promise<VerificationDTO> {
    const v = await Verification.findOne({ agencyId }).exec();
    if (!v) throw new NotFoundError('Verification');

    const prev = v.stage;
    v.stage = input.stage as VerificationStage;
    if (input.remarks) v.remarks = input.remarks;
    if (input.assignedTo) v.assignedTo = input.assignedTo as never;

    v.history.push({
      stage: input.stage as VerificationStage,
      changedBy: userId as never,
      changedByName: userName,
      changedAt: new Date(),
      remarks: input.remarks,
    });

    await v.save();

    await logAudit({
      resource: 'Verification',
      resourceId: v._id.toString(),
      action: 'status_change',
      who: userId,
      before: { stage: prev },
      after: { stage: input.stage },
    });

    logger.info('verification: stage updated', { agencyId, from: prev, to: input.stage });
    return v.toDTO();
  }

  async verifyField(
    agencyId: string,
    input: VerifyFieldInput,
    userId: string,
  ): Promise<VerificationDTO> {
    const v = await Verification.findOne({ agencyId }).exec();
    if (!v) throw new NotFoundError('Verification');

    const fieldKey = input.field;
    (v.fields as Record<string, unknown>)[fieldKey] = {
      status: input.status,
      verifiedBy: userId,
      verifiedAt: new Date().toISOString(),
      remarks: input.remarks,
    };

    // Sync checklist
    const checklistMap: Record<string, keyof typeof v.checklist> = {
      email: 'emailVerified',
      phone: 'phoneVerified',
      website: 'websiteVerified',
      gst: 'gstVerified',
      pan: 'panVerified',
      govtReg: 'govtRegistrationVerified',
      association: 'associationVerified',
    };
    const checkKey = checklistMap[input.field];
    if (checkKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v.checklist as any)[checkKey] = input.status === 'verified';
    }

    // Recompute score
    v.verificationScore = v.computeScore();
    await v.save();

    return v.toDTO();
  }

  async getHistory(agencyId: string): Promise<VerificationDTO['history']> {
    const v = await Verification.findOne({ agencyId }).exec();
    if (!v) return [];
    return v.toDTO().history;
  }
}

export const verificationService = new VerificationService();
