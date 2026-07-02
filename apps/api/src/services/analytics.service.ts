import { Activity } from '@/models/activity.model';
import { Agency } from '@/models/agency.model';
import { ImportJob } from '@/models/import-job.model';
import { Task } from '@/models/task.model';
import { Verification } from '@/models/verification.model';

import type { AnalyticsSummary } from '@travel/types';

class AnalyticsService {
  async getSummary(dateFrom?: string, dateTo?: string): Promise<AnalyticsSummary> {
    const matchDate =
      dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { $gte: new Date(dateFrom) }),
              ...(dateTo && { $lte: new Date(dateTo) }),
            },
          }
        : {};

    const [
      agencyTotal,
      agencyByStatus,
      agencyByMonth,
      verByStage,
      actTotal,
      actByType,
      actByUser,
      taskCompletion,
      taskOverdue,
      taskByPriority,
      importStats,
    ] = await Promise.all([
      Agency.countDocuments({ deletedAt: { $exists: false }, ...matchDate }),
      Agency.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Agency.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Verification.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Activity.countDocuments({ deletedAt: { $exists: false }, ...matchDate }),
      Activity.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Activity.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $limit: 10 },
      ]),
      Task.countDocuments({ status: 'completed', ...matchDate }),
      Task.countDocuments({
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: new Date() },
      }),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      ImportJob.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalRows: { $sum: '$totalRows' },
            success: { $sum: '$successRows' },
            errors: { $sum: '$errorRows' },
          },
        },
      ]),
    ]);

    const totalTasks = await Task.countDocuments({ ...matchDate });
    const byStatus = Object.fromEntries(
      (agencyByStatus as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const byVerStage = Object.fromEntries(
      (verByStage as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const byActType = Object.fromEntries(
      (actByType as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const byTaskPriority = Object.fromEntries(
      (taskByPriority as Array<{ _id: string; count: number }>).map((s) => [s._id, s.count]),
    );
    const importStat = (
      importStats as Array<{ total: number; totalRows: number; success: number; errors: number }>
    )[0];

    return {
      agencies: {
        total: agencyTotal,
        growth: 0,
        byStatus,
        byMonth: (agencyByMonth as Array<{ _id: string; count: number }>).map((m) => ({
          month: m._id,
          count: m.count,
        })),
      },
      verification: {
        rate: agencyTotal > 0 ? Math.round(((byVerStage['verified'] ?? 0) / agencyTotal) * 100) : 0,
        byStage: byVerStage,
        avgDaysToVerify: 0,
      },
      activities: {
        total: actTotal,
        byType: byActType,
        byUser: (
          actByUser as Array<{
            _id: unknown;
            count: number;
            user: Array<{ firstName: string; lastName: string }>;
          }>
        ).map((u) => ({
          userId: String(u._id),
          name: u.user[0] ? `${u.user[0].firstName} ${u.user[0].lastName}` : 'Unknown',
          count: u.count,
        })),
      },
      tasks: {
        completion: totalTasks > 0 ? Math.round((taskCompletion / totalTasks) * 100) : 0,
        overdue: taskOverdue,
        byPriority: byTaskPriority,
      },
      imports: {
        total: importStat?.total ?? 0,
        successRate: importStat?.totalRows
          ? Math.round((importStat.success / importStat.totalRows) * 100)
          : 0,
        totalRows: importStat?.totalRows ?? 0,
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
