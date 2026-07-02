import { notificationRepository } from '@/repositories/notification.repository';

import type { NotificationSummary, NotificationType } from '@travel/types';

class NotificationService {
  async getForUser(userId: string, page = 1, limit = 20): Promise<NotificationSummary> {
    const [{ items }, unread] = await Promise.all([
      notificationRepository.findByUser(userId, { page, limit }),
      notificationRepository.countUnread(userId),
    ]);
    return {
      unreadCount: unread,
      notifications: items.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      })),
    };
  }

  async markRead(id: string): Promise<void> {
    await notificationRepository.markRead(id);
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId);
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body?: string,
    resourceType?: string,
    resourceId?: string,
  ) {
    return notificationRepository.create({
      userId,
      type,
      title,
      ...(body !== undefined && { body }),
      ...(resourceType !== undefined && { resourceType }),
      ...(resourceId !== undefined && { resourceId }),
    });
  }

  async countUnread(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }
}

export const notificationService = new NotificationService();
