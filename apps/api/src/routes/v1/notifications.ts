import { Router } from 'express';

import { notificationController } from '@/controllers/notification.controller';
import { authenticate } from '@/middleware/auth';
import { asyncHandler } from '@/utils';

const router: Router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler((req, res) => notificationController.getNotifications(req, res)),
);
router.post(
  '/read-all',
  asyncHandler((req, res) => notificationController.markAllAsRead(req, res)),
);
router.patch(
  '/:id/read',
  asyncHandler((req, res) => notificationController.markAsRead(req, res)),
);

export default router;
