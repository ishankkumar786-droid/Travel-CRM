import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { activityRepository } from '@/repositories/activity.repository';

import type { ActivityDTO, PaginationMeta } from '@travel/types';
import type { CreateActivityInput, UpdateActivityInput } from '@travel/validation';

class ActivityService {
  async create(
    agencyId: string,
    input: CreateActivityInput,
    userId?: string,
  ): Promise<ActivityDTO> {
    const activity = await activityRepository.create({
      ...input,
      agencyId: agencyId as never,
      ...(input.contactId && { contactId: input.contactId as never }),
      ...(input.nextActionDate && { nextActionDate: new Date(input.nextActionDate) }),
      ...(userId && { createdBy: userId as never }),
    } as never);

    if (userId) {
      await logAudit({
        resource: 'Activity',
        resourceId: activity._id.toString(),
        action: 'create',
        who: userId,
        after: { agencyId, ...input },
      });
    }

    logger.info('activity: created', { activityId: activity._id.toString(), agencyId });
    return activity.toDTO();
  }

  async listByAgency(
    agencyId: string,
    opts: { page: number; limit: number; type?: string; search?: string },
  ): Promise<{ items: ActivityDTO[]; pagination: PaginationMeta }> {
    const { items, pagination } = await activityRepository.findByAgency(agencyId, opts);
    return { items: items.map((a) => a.toDTO()), pagination };
  }

  async getById(id: string): Promise<ActivityDTO> {
    const activity = await activityRepository.findById(id);
    if (!activity) throw new NotFoundError('Activity');
    return activity.toDTO();
  }

  async update(id: string, input: UpdateActivityInput, userId?: string): Promise<ActivityDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.nextActionDate) updateData['nextActionDate'] = new Date(input.nextActionDate);
    if (userId) updateData['updatedBy'] = userId;

    const updated = await activityRepository.update(id, updateData as never);
    if (!updated) throw new NotFoundError('Activity');

    if (userId) {
      await logAudit({
        resource: 'Activity',
        resourceId: id,
        action: 'update',
        who: userId,
        after: input as Record<string, unknown>,
      });
    }
    return updated.toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const deleted = await activityRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Activity');
    if (userId) {
      await logAudit({ resource: 'Activity', resourceId: id, action: 'delete', who: userId });
    }
  }
}

export const activityService = new ActivityService();
