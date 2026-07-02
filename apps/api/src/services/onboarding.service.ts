import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { Agency } from '@/models/agency.model';
import { logAudit } from '@/models/audit-log.model';
import { Onboarding } from '@/models/onboarding.model';

import type { OnboardingDTO, OnboardingStage } from '@travel/types';

const STAGE_ORDER: OnboardingStage[] = [
  'invited',
  'applied',
  'documents_submitted',
  'verification_pending',
  'verified',
  'marketplace_approved',
  'live',
  'suspended',
  'rejected',
];

class OnboardingService {
  async getOrCreate(agencyId: string): Promise<OnboardingDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let ob = await Onboarding.findOne({ agencyId }).exec();
    if (!ob) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ob = await Onboarding.create({
        agencyId,
        stage: 'invited',
        checklist: {},
        history: [],
        marketplaceEligible: false,
        eligibilityReasons: [],
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return (ob as { toDTO(): OnboardingDTO }).toDTO();
  }

  async updateStage(
    agencyId: string,
    stage: OnboardingStage,
    userId: string,
    remarks?: string,
    assignedReviewer?: string,
  ): Promise<OnboardingDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const ob = await Onboarding.findOne({ agencyId }).exec();
    if (!ob) throw new NotFoundError('Onboarding');

    const prev = ob.stage as OnboardingStage;
    ob.stage = stage;
    if (assignedReviewer) ob.assignedReviewer = assignedReviewer as never;

    ob.history.push({ stage, changedBy: userId as never, changedAt: new Date(), remarks } as never);

    // Compute eligibility
    const eligible = ['marketplace_approved', 'live'].includes(stage);
    ob.marketplaceEligible = eligible;

    // Sync agency verification status
    if (stage === 'verified') {
      await Agency.findByIdAndUpdate(agencyId, { $set: { verificationStatus: 'verified' } }).exec();
    }
    if (stage === 'live') {
      await Agency.findByIdAndUpdate(agencyId, {
        $set: { status: 'active', marketplaceStatus: 'listed' },
      }).exec();
    }

    await (ob as { save(): Promise<void> }).save();

    await logAudit({
      resource: 'Onboarding',
      resourceId: agencyId,
      action: 'status_change',
      who: userId,
      before: { stage: prev },
      after: { stage },
    });
    logger.info('onboarding: stage updated', { agencyId, stage });

    return (ob as { toDTO(): OnboardingDTO }).toDTO();
  }

  async list(opts: { stage?: string; assignedReviewer?: string; page: number; limit: number }) {
    const filter: Record<string, unknown> = {};
    if (opts.stage) filter['stage'] = opts.stage;
    if (opts.assignedReviewer) filter['assignedReviewer'] = opts.assignedReviewer;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const items = await Onboarding.find(filter)
      .sort({ updatedAt: -1 })
      .skip((opts.page - 1) * opts.limit)
      .limit(opts.limit)
      .exec();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const total = await Onboarding.countDocuments(filter).exec();
    return { items: (items as Array<{ toDTO(): OnboardingDTO }>).map((o) => o.toDTO()), total };
  }

  getStageOrder(): OnboardingStage[] {
    return STAGE_ORDER;
  }
}

export const onboardingService = new OnboardingService();
