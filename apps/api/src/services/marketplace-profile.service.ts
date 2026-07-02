import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { Agency } from '@/models/agency.model';
import { generatePublicSlug, MarketplaceProfile } from '@/models/marketplace-profile.model';
import { Package } from '@/models/package.model';
import { Verification } from '@/models/verification.model';

import type { MarketplaceProfileDTO, MarketplaceReadiness } from '@travel/types';
import type { UpdateMarketplaceProfileInput } from '@travel/validation';

class MarketplaceProfileService {
  async getOrCreate(agencyId: string): Promise<MarketplaceProfileDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    let profile = await MarketplaceProfile.findOne({ agencyId }).exec();
    if (!profile) {
      const agency = await Agency.findById(agencyId).exec();
      if (!agency) throw new NotFoundError('Agency');
      const slug = generatePublicSlug(agency.name, agency.agencyCode);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      profile = await MarketplaceProfile.create({
        agencyId,
        publicSlug: slug,
        gallery: [],
        socialLinks: {},
        businessHours: [],
        languages: [],
        awards: [],
        certifications: [],
        specializations: [],
        verificationScore: 0,
        profileScore: 0,
        trustScore: 0,
        marketplaceScore: 0,
        readinessPercent: 0,
        missingInfo: [],
        seo: { keywords: [] },
        isPublic: false,
      });
    }
    return (profile as { toDTO(): MarketplaceProfileDTO }).toDTO();
  }

  async update(
    agencyId: string,
    input: UpdateMarketplaceProfileInput,
  ): Promise<MarketplaceProfileDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profile = await MarketplaceProfile.findOneAndUpdate(
      { agencyId },
      { $set: input },
      { new: true, upsert: false },
    ).exec();
    if (!profile) throw new NotFoundError('MarketplaceProfile');
    await this.recalculateScores(agencyId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const updated = await MarketplaceProfile.findOne({ agencyId }).exec();
    return (updated as { toDTO(): MarketplaceProfileDTO }).toDTO();
  }

  async getPublic(slug: string): Promise<MarketplaceProfileDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profile = await MarketplaceProfile.findOne({ publicSlug: slug, isPublic: true }).exec();
    if (!profile) throw new NotFoundError('Agency profile');
    return (profile as { toDTO(): MarketplaceProfileDTO }).toDTO();
  }

  async getReadiness(agencyId: string): Promise<MarketplaceReadiness> {
    const agency = await Agency.findById(agencyId).exec();
    if (!agency) throw new NotFoundError('Agency');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profile = await MarketplaceProfile.findOne({ agencyId }).exec();
    const verification = await Verification.findOne({ agencyId }).exec();
    const packageCount = await Package.countDocuments({ agencyId, status: 'active' }).exec();

    const profileScore = profile ? this.calcProfileScore(profile as Record<string, unknown>) : 0;
    const verificationScore = verification ? verification.verificationScore : 0;
    const trustScore = Math.round((profileScore + verificationScore) / 2);
    const marketplaceScore = Math.round(
      profileScore * 0.4 + verificationScore * 0.4 + (packageCount > 0 ? 20 : 0),
    );

    const missingItems: string[] = [];
    if (!agency.gstNumber) missingItems.push('GST Number');
    if (!agency.website) missingItems.push('Website');
    if (packageCount === 0) missingItems.push('At least one active package');
    if (!profile || !(profile as Record<string, unknown>)['description'])
      missingItems.push('Public description');
    if (verificationScore < 70) missingItems.push('Complete verification (score ≥ 70)');

    const recommendations: string[] = [];
    if (profileScore < 60)
      recommendations.push('Complete your public profile to increase visibility');
    if (packageCount === 0) recommendations.push('Add at least one package to go live');
    if (verificationScore < 70)
      recommendations.push('Complete field verification for higher trust score');

    return {
      agencyId,
      overallScore: marketplaceScore,
      verificationScore,
      profileScore,
      trustScore,
      readinessPercent: Math.min(100, marketplaceScore),
      isEligible: marketplaceScore >= 60 && missingItems.length === 0,
      missingItems,
      recommendations,
      breakdown: {
        profile: {
          score: profileScore,
          maxScore: 40,
          items: ['Description', 'Logo', 'Social Links', 'Languages'],
        },
        verification: {
          score: verificationScore,
          maxScore: 40,
          items: ['GST', 'PAN', 'Phone', 'Email'],
        },
        packages: { score: packageCount > 0 ? 20 : 0, maxScore: 20, items: ['Active Packages'] },
      },
    };
  }

  async recalculateScores(agencyId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profile = await MarketplaceProfile.findOne({ agencyId }).exec();
    if (!profile) return;
    const ps = this.calcProfileScore(profile as Record<string, unknown>);
    const v = await Verification.findOne({ agencyId }).exec();
    const vs = v ? v.verificationScore : 0;
    const pc = await Package.countDocuments({ agencyId, status: 'active' }).exec();
    const ms = Math.round(ps * 0.4 + vs * 0.4 + (pc > 0 ? 20 : 0));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await MarketplaceProfile.findOneAndUpdate(
      { agencyId },
      {
        $set: {
          profileScore: ps,
          verificationScore: vs,
          marketplaceScore: ms,
          readinessPercent: Math.min(100, ms),
        },
      },
    ).exec();
    logger.info('marketplace: scores recalculated', {
      agencyId,
      profileScore: ps,
      marketplaceScore: ms,
    });
  }

  private calcProfileScore(profile: Record<string, unknown>): number {
    let score = 0;
    if (profile['description']) score += 15;
    if (profile['logoUrl']) score += 10;
    if (profile['bannerUrl']) score += 5;
    const langs = profile['languages'] as string[] | undefined;
    if (langs && langs.length > 0) score += 5;
    const specs = profile['specializations'] as string[] | undefined;
    if (specs && specs.length > 0) score += 5;
    const social = profile['socialLinks'] as Record<string, unknown> | undefined;
    if (social && Object.values(social).some(Boolean)) score += 10;
    return Math.min(40, score);
  }
}

export const marketplaceProfileService = new MarketplaceProfileService();
