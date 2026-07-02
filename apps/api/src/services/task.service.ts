import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { taskRepository } from '@/repositories/task.repository';

import type { PaginationMeta, TaskDTO } from '@travel/types';
import type { CreateTaskInput, UpdateTaskInput } from '@travel/validation';

class TaskService {
  async create(agencyId: string, input: CreateTaskInput, userId?: string): Promise<TaskDTO> {
    const task = await taskRepository.create({
      ...input,
      agencyId: agencyId as never,
      ...(input.assignedTo && { assignedTo: input.assignedTo as never }),
      ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
      ...(userId && { createdBy: userId as never }),
    } as never);

    if (userId) {
      await logAudit({
        resource: 'Task',
        resourceId: task._id.toString(),
        action: 'create',
        who: userId,
        after: { agencyId, ...input },
      });
    }

    logger.info('task: created', { taskId: task._id.toString(), agencyId });
    return task.toDTO();
  }

  async listByAgency(
    agencyId: string,
    opts: { page: number; limit: number; status?: string; priority?: string; assignedTo?: string },
  ): Promise<{ items: TaskDTO[]; pagination: PaginationMeta }> {
    const { items, pagination } = await taskRepository.findByAgency(agencyId, opts);
    return { items: items.map((t) => t.toDTO()), pagination };
  }

  async getById(id: string): Promise<TaskDTO> {
    const task = await taskRepository.findById(id);
    if (!task) throw new NotFoundError('Task');
    return task.toDTO();
  }

  async update(id: string, input: UpdateTaskInput, userId?: string): Promise<TaskDTO> {
    const updateData: Record<string, unknown> = { ...input };
    if (input.dueDate) updateData['dueDate'] = new Date(input.dueDate);
    if (userId) updateData['updatedBy'] = userId;

    const updated = await taskRepository.update(id, updateData as never);
    if (!updated) throw new NotFoundError('Task');

    if (userId) {
      await logAudit({
        resource: 'Task',
        resourceId: id,
        action: 'update',
        who: userId,
        after: input as Record<string, unknown>,
      });
    }
    return updated.toDTO();
  }

  async complete(id: string, userId?: string): Promise<TaskDTO> {
    const task = await taskRepository.complete(id);
    if (!task) throw new NotFoundError('Task');
    if (userId) {
      await logAudit({ resource: 'Task', resourceId: id, action: 'update', who: userId });
    }
    return task.toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const deleted = await taskRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Task');
    if (userId) {
      await logAudit({ resource: 'Task', resourceId: id, action: 'delete', who: userId });
    }
  }
}

export const taskService = new TaskService();
