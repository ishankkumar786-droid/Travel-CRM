import { Agency, type IAgency } from '@/models/agency.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { AgencyStatus, AgencyListQuery } from '@travel/types';
import type { FilterQuery, SortOrder } from 'mongoose';

export class AgencyRepository {
  async findById(id: string): Promise<IAgency | null> {
    return Agency.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<IAgency | null> {
    return Agency.findOne({ slug }).exec();
  }

  async findByCode(code: string): Promise<IAgency | null> {
    return Agency.findOne({ agencyCode: code.toUpperCase() }).exec();
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<IAgency> = { email: email.toLowerCase() };
    if (excludeId) filter['_id'] = { $ne: excludeId };
    const count = await Agency.countDocuments(filter).exec();
    return count > 0;
  }

  async findAll(query: AgencyListQuery) {
    const filter: FilterQuery<IAgency> = {};

    // ─── Text search ──────────────────────────────────────────────────────────
    if (query.search?.trim()) {
      filter['$text'] = { $search: query.search.trim() };
    }

    // ─── Filters ──────────────────────────────────────────────────────────────
    if (query.status) filter['status'] = query.status;
    if (query.verificationStatus) filter['verificationStatus'] = query.verificationStatus;
    if (query.marketplaceStatus) filter['marketplaceStatus'] = query.marketplaceStatus;
    if (query.city) filter['address.city'] = new RegExp(query.city, 'i');
    if (query.state) filter['address.state'] = new RegExp(query.state, 'i');
    if (query.country) filter['address.country'] = new RegExp(query.country, 'i');
    if (query.services)
      filter['services'] = { $in: query.services.split(',').map((s) => s.trim()) };
    if (query.destinations)
      filter['destinations'] = { $in: query.destinations.split(',').map((d) => d.trim()) };
    if (query.tags) filter['tags'] = { $in: query.tags.split(',').map((t) => t.trim()) };

    // ─── Date range ───────────────────────────────────────────────────────────
    if (query.dateFrom ?? query.dateTo) {
      filter['createdAt'] = {
        ...(query.dateFrom && { $gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { $lte: new Date(query.dateTo) }),
      };
    }

    // ─── Sorting ──────────────────────────────────────────────────────────────
    const sortFieldMap: Record<string, string> = {
      name: 'name',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      city: 'address.city',
      state: 'address.state',
      rating: 'rating',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'] ?? 'createdAt';
    const sortDir: SortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      Agency.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(getSkip(query.page, query.limit))
        .limit(query.limit)
        .exec(),
      Agency.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async create(data: Partial<IAgency>): Promise<IAgency> {
    const agency = new Agency(data);
    return agency.save();
  }

  async update(id: string, data: Partial<IAgency>): Promise<IAgency | null> {
    return Agency.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await Agency.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(), status: 'archived' as AgencyStatus },
    }).exec();
    return result !== null;
  }

  async restore(id: string): Promise<IAgency | null> {
    return Agency.findByIdAndUpdate(
      id,
      { $unset: { deletedAt: 1 }, $set: { status: 'inactive' as AgencyStatus } },
      { new: true },
    )
      .where({ deletedAt: { $exists: true } })
      .exec();
  }

  async archive(id: string): Promise<IAgency | null> {
    return Agency.findByIdAndUpdate(
      id,
      { $set: { status: 'archived' as AgencyStatus } },
      { new: true },
    ).exec();
  }

  async bulkUpdateStatus(ids: string[], status: AgencyStatus): Promise<number> {
    const result = await Agency.updateMany({ _id: { $in: ids } }, { $set: { status } }).exec();
    return result.modifiedCount;
  }

  async bulkSoftDelete(ids: string[]): Promise<number> {
    const result = await Agency.updateMany(
      { _id: { $in: ids } },
      { $set: { deletedAt: new Date(), status: 'archived' as AgencyStatus } },
    ).exec();
    return result.modifiedCount;
  }

  async bulkRestore(ids: string[]): Promise<number> {
    const result = await Agency.updateMany(
      { _id: { $in: ids }, deletedAt: { $exists: true } },
      { $unset: { deletedAt: 1 }, $set: { status: 'inactive' as AgencyStatus } },
    ).exec();
    return result.modifiedCount;
  }

  async bulkAddTags(ids: string[], tags: string[]): Promise<number> {
    const result = await Agency.updateMany(
      { _id: { $in: ids } },
      { $addToSet: { tags: { $each: tags.map((t) => t.toLowerCase()) } } },
    ).exec();
    return result.modifiedCount;
  }

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [statusCounts, verificationCounts, marketplaceCounts, thisMonth, thisWeek, total] =
      await Promise.all([
        Agency.aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Agency.aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
        ]),
        Agency.aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $group: { _id: '$marketplaceStatus', count: { $sum: 1 } } },
        ]),
        Agency.countDocuments({ createdAt: { $gte: startOfMonth }, deletedAt: { $exists: false } }),
        Agency.countDocuments({ createdAt: { $gte: startOfWeek }, deletedAt: { $exists: false } }),
        Agency.countDocuments({ deletedAt: { $exists: false } }),
      ]);

    const byStatus = Object.fromEntries(
      (statusCounts as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const byVerification = Object.fromEntries(
      (verificationCounts as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const byMarketplace = Object.fromEntries(
      (marketplaceCounts as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );

    return {
      total,
      active: byStatus['active'] ?? 0,
      inactive: byStatus['inactive'] ?? 0,
      pending: byStatus['pending'] ?? 0,
      archived: byStatus['archived'] ?? 0,
      verified: byVerification['verified'] ?? 0,
      unverified: byVerification['unverified'] ?? 0,
      listed: byMarketplace['listed'] ?? 0,
      addedThisMonth: thisMonth,
      addedThisWeek: thisWeek,
    };
  }

  async findRecent(limit = 5): Promise<IAgency[]> {
    return Agency.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  async count(): Promise<number> {
    return Agency.countDocuments({ deletedAt: { $exists: false } }).exec();
  }

  async exportAll(filter: FilterQuery<IAgency>): Promise<IAgency[]> {
    return Agency.find(filter).sort({ createdAt: -1 }).limit(10000).exec();
  }
}

export const agencyRepository = new AgencyRepository();
