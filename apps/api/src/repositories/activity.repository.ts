import { Activity, type IActivity } from '@/models/activity.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { FilterQuery } from 'mongoose';

export class ActivityRepository {
  async findById(id: string): Promise<IActivity | null> {
    return Activity.findById(id).exec();
  }

  async findByAgency(
    agencyId: string,
    opts: { page: number; limit: number; type?: string; search?: string },
  ) {
    const filter: FilterQuery<IActivity> = { agencyId };
    if (opts.type) filter['type'] = opts.type;
    if (opts.search) {
      const rx = new RegExp(opts.search, 'i');
      filter['$or'] = [{ title: rx }, { description: rx }, { outcome: rx }];
    }
    const [items, total] = await Promise.all([
      Activity.find(filter)
        .sort({ createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Activity.countDocuments(filter).exec(),
    ]);
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async create(data: Partial<IActivity>): Promise<IActivity> {
    const activity = new Activity(data);
    return activity.save();
  }

  async update(id: string, data: Partial<IActivity>): Promise<IActivity | null> {
    return Activity.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await Activity.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() },
    }).exec();
    return result !== null;
  }

  async countByAgency(agencyId: string): Promise<number> {
    return Activity.countDocuments({ agencyId }).exec();
  }

  async countTodayByUser(userId: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return Activity.countDocuments({
      createdBy: userId,
      createdAt: { $gte: start, $lte: end },
    }).exec();
  }

  async findRecentForDashboard(limit: number): Promise<IActivity[]> {
    return Activity.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export const activityRepository = new ActivityRepository();
