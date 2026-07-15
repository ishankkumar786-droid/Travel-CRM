import { Router } from 'express';
import { notificationController } from '@/controllers/notification.controller';
import { asyncHandler } from '@/utils';
import { authenticate } from '@/middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', asyncHandler(notificationController.getNotifications));
router.post('/read-all', asyncHandler(notificationController.markAllAsRead));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

export default router;
