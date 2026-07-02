import { activityRepository } from '@/repositories/activity.repository';
import { agencyRepository } from '@/repositories/agency.repository';
import { followUpRepository } from '@/repositories/followup.repository';
import { taskRepository } from '@/repositories/task.repository';

import type { CRMDashboardStats } from '@travel/types';

class CRMDashboardService {
  async getStats(userId: string): Promise<CRMDashboardStats> {
    const [
      agencyStats,
      taskOverdue,
      taskToday,
      taskAssigned,
      taskPending,
      fuToday,
      fuOverdue,
      actRecent,
      actToday,
    ] = await Promise.all([
      agencyRepository.getStats(),
      taskRepository.countOverdue(userId),
      taskRepository.countDueToday(userId),
      taskRepository.findAssignedTo(userId, 1).then((r) => r.length),
      taskRepository
        .findByAgency('', { page: 1, limit: 1, status: 'pending' })
        .then((r) => r.pagination.total)
        .catch(() => 0),
      followUpRepository.countDueToday(userId),
      followUpRepository.countOverdue(userId),
      activityRepository.findRecentForDashboard(1).then((r) => r.length),
      activityRepository.countTodayByUser(userId),
    ]);

    return {
      agencies: {
        total: agencyStats.total,
        active: agencyStats.active,
        pending: agencyStats.pending,
        addedThisWeek: agencyStats.addedThisWeek,
        addedThisMonth: agencyStats.addedThisMonth,
      },
      tasks: {
        overdue: taskOverdue,
        dueToday: taskToday,
        assignedToMe: taskAssigned,
        totalPending: taskPending,
      },
      followups: {
        dueToday: fuToday,
        overdue: fuOverdue,
        upcomingThisWeek: 0,
      },
      activities: {
        recentCount: actRecent,
        todayCount: actToday,
      },
    };
  }
}

export const crmDashboardService = new CRMDashboardService();
