import { Task, type ITask } from '@/models/task.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { FilterQuery } from 'mongoose';

export class TaskRepository {
  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id).exec();
  }

  async findByAgency(
    agencyId: string,
    opts: { page: number; limit: number; status?: string; priority?: string; assignedTo?: string },
  ) {
    const filter: FilterQuery<ITask> = { agencyId };
    if (opts.status) filter['status'] = opts.status;
    if (opts.priority) filter['priority'] = opts.priority;
    if (opts.assignedTo) filter['assignedTo'] = opts.assignedTo;

    const [items, total] = await Promise.all([
      Task.find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Task.countDocuments(filter).exec(),
    ]);
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async create(data: Partial<ITask>): Promise<ITask> {
    const task = new Task(data);
    return task.save();
  }

  async update(id: string, data: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async complete(id: string): Promise<ITask | null> {
    return Task.findByIdAndUpdate(
      id,
      { $set: { status: 'completed', completedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await Task.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
    return result !== null;
  }

  async countOverdue(assignedTo?: string): Promise<number> {
    const filter: FilterQuery<ITask> = {
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() },
    };
    if (assignedTo) filter['assignedTo'] = assignedTo;
    return Task.countDocuments(filter).exec();
  }

  async countDueToday(assignedTo?: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const filter: FilterQuery<ITask> = {
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $gte: start, $lte: end },
    };
    if (assignedTo) filter['assignedTo'] = assignedTo;
    return Task.countDocuments(filter).exec();
  }

  async findAssignedTo(userId: string, limit = 10): Promise<ITask[]> {
    return Task.find({
      assignedTo: userId,
      status: { $in: ['pending', 'in_progress'] },
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .exec();
  }
}

export const taskRepository = new TaskRepository();
