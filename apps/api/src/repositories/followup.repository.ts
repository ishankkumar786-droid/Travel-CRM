import { FollowUp, type IFollowUp } from '@/models/followup.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { FilterQuery } from 'mongoose';

export class FollowUpRepository {
  async findById(id: string): Promise<IFollowUp | null> {
    return FollowUp.findById(id).exec();
  }

  async findByAgency(
    agencyId: string,
    opts: { page: number; limit: number; status?: string; assignedTo?: string },
  ) {
    const filter: FilterQuery<IFollowUp> = { agencyId };
    if (opts.status) filter['status'] = opts.status;
    if (opts.assignedTo) filter['assignedTo'] = opts.assignedTo;

    const [items, total] = await Promise.all([
      FollowUp.find(filter)
        .sort({ scheduledAt: 1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      FollowUp.countDocuments(filter).exec(),
    ]);
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async create(data: Partial<IFollowUp>): Promise<IFollowUp> {
    const followup = new FollowUp(data);
    return followup.save();
  }

  async update(id: string, data: Partial<IFollowUp>): Promise<IFollowUp | null> {
    return FollowUp.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async complete(id: string): Promise<IFollowUp | null> {
    return FollowUp.findByIdAndUpdate(
      id,
      { $set: { status: 'completed', completedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await FollowUp.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() },
    }).exec();
    return result !== null;
  }

  async countDueToday(assignedTo?: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const filter: FilterQuery<IFollowUp> = {
      status: 'pending',
      scheduledAt: { $gte: start, $lte: end },
    };
    if (assignedTo) filter['assignedTo'] = assignedTo;
    return FollowUp.countDocuments(filter).exec();
  }

  async countOverdue(assignedTo?: string): Promise<number> {
    const filter: FilterQuery<IFollowUp> = {
      status: 'pending',
      scheduledAt: { $lt: new Date() },
    };
    if (assignedTo) filter['assignedTo'] = assignedTo;
    return FollowUp.countDocuments(filter).exec();
  }

  async findUpcoming(userId: string, days = 7, limit = 10): Promise<IFollowUp[]> {
    const end = new Date();
    end.setDate(end.getDate() + days);
    return FollowUp.find({
      assignedTo: userId,
      status: 'pending',
      scheduledAt: { $gte: new Date(), $lte: end },
    })
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .exec();
  }

  /** Mark overdue follow-ups automatically */
  async markOverdue(): Promise<number> {
    const result = await FollowUp.updateMany(
      { status: 'pending', scheduledAt: { $lt: new Date() } },
      { $set: { status: 'overdue' } },
    ).exec();
    return result.modifiedCount;
  }
}

export const followUpRepository = new FollowUpRepository();
