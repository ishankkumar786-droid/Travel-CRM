import { Notification, type INotification } from '@/models/notification.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { NotificationType } from '@travel/types';

export class NotificationRepository {
  async findByUser(userId: string, opts: { page: number; limit: number; unreadOnly?: boolean }) {
    const filter = opts.unreadOnly ? { userId, isRead: false } : { userId };
    const [items, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Notification.countDocuments(filter).exec(),
    ]);
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false }).exec();
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    resourceType?: string;
    resourceId?: string;
  }): Promise<INotification> {
    return Notification.create(data);
  }

  async markRead(id: string): Promise<void> {
    await Notification.findByIdAndUpdate(id, {
      $set: { isRead: true, readAt: new Date() },
    }).exec();
  }

  async markAllRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();
  }
}

export const notificationRepository = new NotificationRepository();
