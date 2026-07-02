import { Agency } from '@/models/agency.model';
import { Destination } from '@/models/destination.model';
import { MarketplaceProfile } from '@/models/marketplace-profile.model';
import { Package } from '@/models/package.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { RecommendationResult } from '@travel/types';
import type { SortOrder } from 'mongoose';

class PublicApiService {
  async listPublicAgencies(opts: {
    page: number;
    limit: number;
    q?: string;
    destination?: string;
    verified?: boolean;
    featured?: boolean;
  }) {
    const filter: Record<string, unknown> = {
      status: 'active',
      marketplaceStatus: { $in: ['listed', 'featured'] },
      deletedAt: { $exists: false },
    };
    if (opts.verified) filter['verificationStatus'] = 'verified';
    if (opts.q) filter['$text'] = { $search: opts.q };
    if (opts.destination) filter['address.city'] = new RegExp(opts.destination, 'i');

    const [items, total] = await Promise.all([
      Agency.find(filter)
        .select(
          'agencyCode name ownerName email phone address services destinations tags verificationStatus marketplaceStatus rating profileCompletion',
        )
        .sort({ rating: -1, profileCompletion: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Agency.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((a) => a.toListItem()),
      pagination: buildPaginationMeta(opts.page, opts.limit, total),
    };
  }

  async listPublicPackages(opts: {
    page: number;
    limit: number;
    destination?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    minDays?: number;
    maxDays?: number;
    featured?: boolean;
    sortBy?: string;
  }) {
    const filter: Record<string, unknown> = { status: 'active' };
    if (opts.destination) filter['destinationName'] = new RegExp(opts.destination, 'i');
    if (opts.category) filter['category'] = opts.category;
    if (opts.featured) filter['isFeatured'] = true;
    if (opts.minBudget !== undefined || opts.maxBudget !== undefined) {
      filter['pricePerPerson'] = {
        ...(opts.minBudget !== undefined && { $gte: opts.minBudget }),
        ...(opts.maxBudget !== undefined && { $lte: opts.maxBudget }),
      };
    }
    if (opts.minDays !== undefined) filter['durationDays'] = { $gte: opts.minDays };
    if (opts.maxDays !== undefined) {
      const existing = filter['durationDays'] as Record<string, number> | undefined;
      filter['durationDays'] = { ...(existing ?? {}), $lte: opts.maxDays };
    }

    const sortMap: Record<string, [string, SortOrder][]> = {
      featured: [
        ['isFeatured', -1],
        ['createdAt', -1],
      ],
      price_asc: [['pricePerPerson', 1]],
      price_desc: [['pricePerPerson', -1]],
      newest: [['createdAt', -1]],
      trending: [
        ['isFeatured', -1],
        ['createdAt', -1],
      ],
    };
    const sort: [string, SortOrder][] = sortMap[opts.sortBy ?? 'featured'] ??
      sortMap['featured'] ?? [['createdAt', -1]];

    const [items, total] = await Promise.all([
      Package.find(filter).sort(sort).skip(getSkip(opts.page, opts.limit)).limit(opts.limit).exec(),
      Package.countDocuments(filter).exec(),
    ]);

    return {
      items: items.map((p) => (p as { toDTO(): object }).toDTO()),
      pagination: buildPaginationMeta(opts.page, opts.limit, total),
    };
  }

  async listPublicDestinations(type?: string, featured?: boolean) {
    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (type) filter['type'] = type;
    if (featured) filter['isFeatured'] = true;
    const items = await Destination.find(filter).sort({ name: 1 }).limit(200).exec();
    return items.map((d) => (d as { toDTO(): object }).toDTO());
  }

  async getRecommendations(): Promise<RecommendationResult> {
    const [agencies, packages, recent] = await Promise.all([
      Agency.find({
        status: 'active',
        marketplaceStatus: { $in: ['listed', 'featured'] },
        deletedAt: { $exists: false },
      })
        .select('agencyCode name address verificationStatus createdAt')
        .sort({ rating: -1 })
        .limit(6)
        .exec(),
      Package.find({ status: 'active', isFeatured: true })
        .select('name slug pricePerPerson currency destinationName')
        .sort({ createdAt: -1 })
        .limit(6)
        .exec(),
      Agency.find({ status: 'active', deletedAt: { $exists: false } })
        .select('agencyCode name createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
    ]);

    return {
      popularAgencies: agencies.map((a) => ({
        id: a._id.toString(),
        name: a.name,
        slug: a.agencyCode.toLowerCase(),
        city: a.address?.city ?? '',
        verificationScore: 0,
      })),
      trendingPackages: packages.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug ?? '',
        price: p.pricePerPerson ?? 0,
        currency: p.currency ?? 'USD',
        destination: (p.destinationName as string) ?? '',
      })),
      recentlyAdded: recent.map((a) => ({
        id: a._id.toString(),
        name: a.name,
        slug: a.agencyCode.toLowerCase(),
        createdAt: a.createdAt.toISOString(),
      })),
      featuredAgencies: [],
    };
  }

  async getPublicAgencyProfile(slug: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const profile = await MarketplaceProfile.findOne({ publicSlug: slug, isPublic: true }).exec();
    if (!profile) return null;
    return (profile as { toDTO(): object }).toDTO();
  }
}

export const publicApiService = new PublicApiService();
