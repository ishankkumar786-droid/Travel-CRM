import { ConflictError, NotFoundError } from '@/errors';
import { eventBus } from '@/events';
import { logger } from '@/lib/logger';
import { generateAgencyCode, generateAgencySlug } from '@/models/agency.model';
import { agencyRepository } from '@/repositories/agency.repository';

import type {
  AgencyDTO,
  AgencyListItem,
  AgencyListQuery,
  AgencyStats,
  BulkOperationResult,
  PaginationMeta,
} from '@travel/types';
import type { CreateAgencyInput, UpdateAgencyInput } from '@travel/validation';

export interface AgencyListResult {
  items: AgencyListItem[];
  pagination: PaginationMeta;
}

class AgencyService {
  async create(input: CreateAgencyInput, userId?: string): Promise<AgencyDTO> {
    if (await agencyRepository.emailExists(input.email)) {
      throw new ConflictError('An agency with this email already exists');
    }

    const agencyCode = await generateAgencyCode();
    const slug = generateAgencySlug(input.name, agencyCode);

    const agency = await agencyRepository.create({
      ...input,
      agencyCode,
      slug,
      status: 'pending',
      verificationStatus: 'unverified',
      marketplaceStatus: 'unlisted',
      profileCompletion: 0,
      ...(userId && { createdBy: userId as never }),
    } as never);

    // Compute and save profile completion
    const completion = agency.computeProfileCompletion();
    agency.profileCompletion = completion;
    await agency.save();

    eventBus.emit('agency.created', { agencyId: agency._id.toString() });
    logger.info('agency: created', { agencyId: agency._id.toString(), code: agencyCode });

    return agency.toDTO();
  }

  async getById(id: string): Promise<AgencyDTO> {
    const agency = await agencyRepository.findById(id);
    if (!agency) throw new NotFoundError('Agency');
    return agency.toDTO();
  }

  async getBySlug(slug: string): Promise<AgencyDTO> {
    const agency = await agencyRepository.findBySlug(slug);
    if (!agency) throw new NotFoundError('Agency');
    return agency.toDTO();
  }

  async list(query: AgencyListQuery): Promise<AgencyListResult> {
    const { items, pagination } = await agencyRepository.findAll(query);
    return { items: items.map((a) => a.toListItem()), pagination };
  }

  async update(id: string, input: UpdateAgencyInput, userId?: string): Promise<AgencyDTO> {
    const existing = await agencyRepository.findById(id);
    if (!existing) throw new NotFoundError('Agency');

    if (input.email && input.email !== existing.email) {
      if (await agencyRepository.emailExists(input.email, id)) {
        throw new ConflictError('An agency with this email already exists');
      }
    }

    const updated = await agencyRepository.update(id, {
      ...input,
      ...(userId && { updatedBy: userId as never }),
    } as never);

    if (!updated) throw new NotFoundError('Agency');

    // Recompute profile completion
    const completion = updated.computeProfileCompletion();
    if (completion !== updated.profileCompletion) {
      await agencyRepository.update(id, { profileCompletion: completion } as never);
      updated.profileCompletion = completion;
    }

    logger.info('agency: updated', { agencyId: id });
    return updated.toDTO();
  }

  async delete(id: string): Promise<void> {
    const deleted = await agencyRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Agency');
    eventBus.emit('agency.deleted', { agencyId: id });
    logger.info('agency: deleted', { agencyId: id });
  }

  async archive(id: string): Promise<AgencyDTO> {
    const archived = await agencyRepository.archive(id);
    if (!archived) throw new NotFoundError('Agency');
    logger.info('agency: archived', { agencyId: id });
    return archived.toDTO();
  }

  async restore(id: string): Promise<AgencyDTO> {
    const restored = await agencyRepository.restore(id);
    if (!restored) throw new NotFoundError('Agency');
    logger.info('agency: restored', { agencyId: id });
    return restored.toDTO();
  }

  async bulkOperation(ids: string[], action: string, value?: string): Promise<BulkOperationResult> {
    let processed = 0;
    const errors: string[] = [];

    try {
      switch (action) {
        case 'delete':
          processed = await agencyRepository.bulkSoftDelete(ids);
          break;
        case 'archive':
          processed = await agencyRepository.bulkUpdateStatus(ids, 'archived');
          break;
        case 'restore':
          processed = await agencyRepository.bulkRestore(ids);
          break;
        case 'activate':
          processed = await agencyRepository.bulkUpdateStatus(ids, 'active');
          break;
        case 'deactivate':
          processed = await agencyRepository.bulkUpdateStatus(ids, 'inactive');
          break;
        default:
          errors.push(`Unknown action: ${action}`);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'Bulk operation failed');
    }

    if (value && action === 'tag') {
      const tags = value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      processed = await agencyRepository.bulkAddTags(ids, tags);
    }

    logger.info('agency: bulk operation', { action, count: processed, total: ids.length });
    return {
      processed,
      failed: ids.length - processed,
      errors: errors.length ? errors : undefined,
    };
  }

  async getStats(): Promise<AgencyStats> {
    return agencyRepository.getStats();
  }

  async getRecent(limit?: number): Promise<AgencyListItem[]> {
    const agencies = await agencyRepository.findRecent(limit);
    return agencies.map((a) => a.toListItem());
  }

  async exportCsv(query: Partial<AgencyListQuery>): Promise<string> {
    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (query.status) filter['status'] = query.status;

    const agencies = await agencyRepository.exportAll(filter);
    const rows = agencies.map((a) => {
      const d = a.toDTO();
      return [
        d.agencyCode,
        d.name,
        d.ownerName,
        d.email,
        d.phone,
        d.address.city,
        d.address.state,
        d.address.country,
        d.status,
        d.verificationStatus,
        d.services.join('|'),
        d.tags.join('|'),
        d.createdAt,
      ]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',');
    });

    const header = [
      'Code',
      'Name',
      'Owner',
      'Email',
      'Phone',
      'City',
      'State',
      'Country',
      'Status',
      'Verification',
      'Services',
      'Tags',
      'Created',
    ].join(',');

    return [header, ...rows].join('\n');
  }

  async exportJson(query: Partial<AgencyListQuery>): Promise<AgencyDTO[]> {
    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (query.status) filter['status'] = query.status;
    const agencies = await agencyRepository.exportAll(filter);
    return agencies.map((a) => a.toDTO());
  }
}

export const agencyService = new AgencyService();
