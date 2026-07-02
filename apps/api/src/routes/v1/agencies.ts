import {
  agencyListQuerySchema,
  bulkOperationSchema,
  createAgencySchema,
  updateAgencySchema,
} from '@travel/validation';
import { Router } from 'express';

import { agencyController } from '@/controllers/agency.controller';
import { authenticate, requirePermission } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

// All agency routes require authentication
router.use(authenticate);

// ─── Statistics ───────────────────────────────────────────────────────────────
router.get(
  '/stats',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => agencyController.getStats(req, res)),
);

// ─── Export ───────────────────────────────────────────────────────────────────
router.get(
  '/export/csv',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => agencyController.exportCsv(req, res)),
);

router.get(
  '/export/json',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => agencyController.exportJson(req, res)),
);

// ─── Bulk operations ──────────────────────────────────────────────────────────
router.post(
  '/bulk',
  requirePermission('agencies.write'),
  validate(bulkOperationSchema),
  asyncHandler((req, res) => agencyController.bulk(req, res)),
);

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router.get(
  '/',
  requirePermission('agencies.read'),
  validate(agencyListQuerySchema, 'query'),
  asyncHandler((req, res) => agencyController.list(req, res)),
);

router.post(
  '/',
  requirePermission('agencies.write'),
  validate(createAgencySchema),
  asyncHandler((req, res) => agencyController.create(req, res)),
);

router.get(
  '/:id',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => agencyController.getById(req, res)),
);

router.put(
  '/:id',
  requirePermission('agencies.write'),
  validate(updateAgencySchema),
  asyncHandler((req, res) => agencyController.update(req, res)),
);

router.delete(
  '/:id',
  requirePermission('agencies.delete'),
  asyncHandler((req, res) => agencyController.delete(req, res)),
);

router.patch(
  '/:id/archive',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => agencyController.archive(req, res)),
);

router.patch(
  '/:id/restore',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => agencyController.restore(req, res)),
);

export default router;
