import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { generatePackageSlug, Package } from '@/models/package.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { PackageDTO } from '@travel/types';
import type { CreatePackageInput, UpdatePackageInput } from '@travel/validation';

class PackageService {
  async create(agencyId: string, input: CreatePackageInput, userId?: string): Promise<PackageDTO> {
    const slug = await generatePackageSlug(input.name, agencyId);
    const pkg = await Package.create({
      ...input,
      agencyId,
      slug,
      version: 1,
      ...(userId && { createdBy: userId }),
    });
    if (userId)
      await logAudit({
        resource: 'Package',
        resourceId: (pkg._id as { toString(): string }).toString(),
        action: 'create',
        who: userId,
      });
    logger.info('package: created', { agencyId, slug });
    return (pkg as { toDTO(): PackageDTO }).toDTO();
  }

  async listByAgency(agencyId: string, opts: { page: number; limit: number; status?: string }) {
    const filter: Record<string, unknown> = { agencyId };
    if (opts.status) filter['status'] = opts.status;
    const [items, total] = await Promise.all([
      Package.find(filter)
        .sort({ createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Package.countDocuments(filter).exec(),
    ]);
    return {
      items: items.map((p) => (p as { toDTO(): PackageDTO }).toDTO()),
      pagination: buildPaginationMeta(opts.page, opts.limit, total),
    };
  }

  async getById(id: string): Promise<PackageDTO> {
    const pkg = await Package.findById(id).exec();
    if (!pkg) throw new NotFoundError('Package');
    return (pkg as { toDTO(): PackageDTO }).toDTO();
  }

  async update(id: string, input: UpdatePackageInput, userId?: string): Promise<PackageDTO> {
    const pkg = await Package.findByIdAndUpdate(
      id,
      { $set: { ...input }, $inc: { version: 1 } },
      { new: true },
    ).exec();
    if (!pkg) throw new NotFoundError('Package');
    if (userId)
      await logAudit({
        resource: 'Package',
        resourceId: id,
        action: 'update',
        who: userId,
        after: input as Record<string, unknown>,
      });
    return (pkg as { toDTO(): PackageDTO }).toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const result = await Package.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(), status: 'archived' },
    }).exec();
    if (!result) throw new NotFoundError('Package');
    if (userId)
      await logAudit({ resource: 'Package', resourceId: id, action: 'delete', who: userId });
  }

  async listPublic(opts: {
    page: number;
    limit: number;
    destination?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }) {
    const filter: Record<string, unknown> = { status: 'active' };
    if (opts.destination) filter['destinationName'] = new RegExp(opts.destination, 'i');
    if (opts.category) filter['category'] = opts.category;
    if (opts.featured) filter['isFeatured'] = true;
    if (opts.minPrice !== undefined || opts.maxPrice !== undefined) {
      filter['pricePerPerson'] = {
        ...(opts.minPrice !== undefined && { $gte: opts.minPrice }),
        ...(opts.maxPrice !== undefined && { $lte: opts.maxPrice }),
      };
    }
    const [items, total] = await Promise.all([
      Package.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Package.countDocuments(filter).exec(),
    ]);
    return {
      items: items.map((p) => (p as { toDTO(): PackageDTO }).toDTO()),
      pagination: buildPaginationMeta(opts.page, opts.limit, total),
    };
  }
}

export const packageService = new PackageService();
