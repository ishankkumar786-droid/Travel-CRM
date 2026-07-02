import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { followUpRepository } from '@/repositories/followup.repository';

import type { FollowUpDTO, PaginationMeta } from '@travel/types';
import type { CreateFollowUpInput, UpdateFollowUpInput } from '@travel/validation';

class FollowUpService {
  async create(
    agencyId: string,
    input: CreateFollowUpInput,
    userId?: string,
  ): Promise<FollowUpDTO> {
    const followup = await followUpRepository.create({
      ...input,
      agencyId: agencyId as never,
      scheduledAt: new Date(input.scheduledAt),
      ...(input.reminderAt && { reminderAt: new Date(input.reminderAt) }),
      ...(input.contactId && { contactId: input.contactId as never }),
      ...(input.assignedTo && { assignedTo: input.assignedTo as never }),
      ...(userId && { createdBy: userId as never }),
    } as never);

    if (userId) {
      await logAudit({
        resource: 'FollowUp',
        resourceId: followup._id.toString(),
        action: 'create',
        who: userId,
      });
    }

    logger.info('followup: created', { followupId: followup._id.toString(), agencyId });
    return followup.toDTO();
  }

  async listByAgency(
    agencyId: string,
    opts: { page: number; limit: number; status?: string; assignedTo?: string },
  ): Promise<{ items: FollowUpDTO[]; pagination: PaginationMeta }> {
    const { items, pagination } = await followUpRepository.findByAgency(agencyId, opts);
    return { items: items.map((f) => f.toDTO()), pagination };
  }

  async getById(id: string): Promise<FollowUpDTO> {
    const followup = await followUpRepository.findById(id);
    if (!followup) throw new NotFoundError('FollowUp');
    return followup.toDTO();
  }

  async update(id: string, input: UpdateFollowUpInput, userId?: string): Promise<FollowUpDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.scheduledAt) updateData['scheduledAt'] = new Date(input.scheduledAt);
    if (input.reminderAt) updateData['reminderAt'] = new Date(input.reminderAt);

    const updated = await followUpRepository.update(id, updateData as never);
    if (!updated) throw new NotFoundError('FollowUp');

    if (userId) {
      await logAudit({ resource: 'FollowUp', resourceId: id, action: 'update', who: userId });
    }
    return updated.toDTO();
  }

  async complete(id: string, userId?: string): Promise<FollowUpDTO> {
    const followup = await followUpRepository.complete(id);
    if (!followup) throw new NotFoundError('FollowUp');
    if (userId) {
      await logAudit({ resource: 'FollowUp', resourceId: id, action: 'update', who: userId });
    }
    return followup.toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const deleted = await followUpRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('FollowUp');
    if (userId) {
      await logAudit({ resource: 'FollowUp', resourceId: id, action: 'delete', who: userId });
    }
  }
}

export const followUpService = new FollowUpService();
