import path from 'path';

import {
  analyticsQuerySchema,
  auditLogFilterSchema,
  inviteUserSchema,
  systemSettingsSchema,
  updateVerificationStageSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  verifyFieldSchema,
} from '@travel/validation';
import { Router } from 'express';
import multer from 'multer';

import {
  analyticsController,
  auditController,
  documentController,
  importController,
  notificationController,
  settingsController,
  userMgmtController,
  verificationController,
} from '@/controllers/phase6.controller';
import { authenticate, requirePermission } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// Multer for file uploads — memory storage for imports, disk for documents
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
const diskUpload = multer({
  dest: path.join(process.cwd(), 'uploads'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(authenticate);

// ─── Verification ─────────────────────────────────────────────────────────────
router.get(
  '/agencies/:agencyId/verification',
  requirePermission('verification.read'),
  asyncHandler((req, res) => verificationController.get(req, res)),
);
router.put(
  '/agencies/:agencyId/verification/stage',
  requirePermission('verification.write'),
  validate(updateVerificationStageSchema),
  asyncHandler((req, res) => verificationController.updateStage(req, res)),
);
router.put(
  '/agencies/:agencyId/verification/fields',
  requirePermission('verification.write'),
  validate(verifyFieldSchema),
  asyncHandler((req, res) => verificationController.verifyField(req, res)),
);
router.get(
  '/agencies/:agencyId/verification/history',
  requirePermission('verification.read'),
  asyncHandler((req, res) => verificationController.getHistory(req, res)),
);

// ─── Documents ────────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/documents',
  requirePermission('agencies.write'),
  diskUpload.single('file'),
  asyncHandler((req, res) => documentController.upload(req, res)),
);
router.get(
  '/agencies/:agencyId/documents',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => documentController.list(req, res)),
);
router.put(
  '/documents/:id/status',
  requirePermission('verification.write'),
  asyncHandler((req, res) => documentController.updateStatus(req, res)),
);
router.delete(
  '/documents/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => documentController.delete(req, res)),
);

// ─── Import ───────────────────────────────────────────────────────────────────
router.post(
  '/import/preview',
  requirePermission('agencies.write'),
  memoryUpload.single('file'),
  asyncHandler((req, res) => importController.preview(req, res)),
);
router.post(
  '/import/process',
  requirePermission('agencies.write'),
  asyncHandler(async (req, res) => {
    importController.process(req, res);
  }),
);
router.get(
  '/import/jobs',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => importController.list(req, res)),
);
router.get(
  '/import/jobs/:id',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => importController.getJob(req, res)),
);

// ─── User Management ──────────────────────────────────────────────────────────
router.get(
  '/users',
  requirePermission('users.read'),
  asyncHandler((req, res) => userMgmtController.list(req, res)),
);
router.get(
  '/users/:id',
  requirePermission('users.read'),
  asyncHandler((req, res) => userMgmtController.getById(req, res)),
);
router.post(
  '/users/invite',
  requirePermission('users.write'),
  validate(inviteUserSchema),
  asyncHandler((req, res) => userMgmtController.invite(req, res)),
);
router.put(
  '/users/:id/role',
  requirePermission('users.write'),
  validate(updateUserRoleSchema),
  asyncHandler((req, res) => userMgmtController.updateRole(req, res)),
);
router.put(
  '/users/:id/status',
  requirePermission('users.write'),
  validate(updateUserStatusSchema),
  asyncHandler((req, res) => userMgmtController.updateStatus(req, res)),
);
router.delete(
  '/users/:id',
  requirePermission('users.delete'),
  asyncHandler((req, res) => userMgmtController.delete(req, res)),
);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get(
  '/settings',
  requirePermission('settings.manage'),
  asyncHandler((req, res) => settingsController.get(req, res)),
);
router.put(
  '/settings',
  requirePermission('settings.manage'),
  validate(systemSettingsSchema),
  asyncHandler((req, res) => settingsController.update(req, res)),
);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get(
  '/analytics',
  requirePermission('reports.read'),
  validate(analyticsQuerySchema, 'query'),
  asyncHandler((req, res) => analyticsController.getSummary(req, res)),
);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get(
  '/notifications',
  asyncHandler((req, res) => notificationController.list(req, res)),
);
router.get(
  '/notifications/unread-count',
  asyncHandler((req, res) => notificationController.unreadCount(req, res)),
);
router.put(
  '/notifications/:id/read',
  asyncHandler((req, res) => notificationController.markRead(req, res)),
);
router.put(
  '/notifications/read-all',
  asyncHandler((req, res) => notificationController.markAllRead(req, res)),
);

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get(
  '/audit-logs',
  requirePermission('settings.manage'),
  validate(auditLogFilterSchema, 'query'),
  asyncHandler((req, res) => auditController.list(req, res)),
);

export default router;
