import { type Request, type Response } from 'express';

import { AppError } from '@/errors';
import { sendSuccess } from '@/lib/response';
import { notificationService } from '@/services/notification.service';

export const notificationController = {
  async getNotifications(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Unauthorized', 'Unauthorized');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await notificationService.getForUser(userId, page, limit);
    sendSuccess(res, data, 'Notifications retrieved');
  },

  async markAsRead(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Unauthorized', 'Unauthorized');

    const { id } = req.params;
    if (!id) throw new AppError(400, 'Bad Request', 'Notification ID is required');

    await notificationService.markRead(id);
    sendSuccess(res, null, 'Notification marked as read');
  },

  async markAllAsRead(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Unauthorized', 'Unauthorized');

    await notificationService.markAllRead(userId);
    sendSuccess(res, null, 'All notifications marked as read');
  },
};
