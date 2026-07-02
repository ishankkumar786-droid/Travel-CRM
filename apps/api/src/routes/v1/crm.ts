import {
  createActivitySchema,
  createContactSchema,
  createFollowUpSchema,
  createNoteSchema,
  createTaskSchema,
  globalSearchSchema,
  updateActivitySchema,
  updateContactSchema,
  updateFollowUpSchema,
  updateNoteSchema,
  updateTaskSchema,
} from '@travel/validation';
import { Router } from 'express';

import {
  activityController,
  contactController,
  crmDashboardController,
  followUpController,
  noteController,
  searchController,
  taskController,
  timelineController,
} from '@/controllers/crm.controller';
import { authenticate, requirePermission } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.use(authenticate);

// ─── CRM Dashboard ────────────────────────────────────────────────────────────
router.get(
  '/dashboard/crm-stats',
  requirePermission('dashboard.read'),
  asyncHandler((req, res) => crmDashboardController.getStats(req, res)),
);

// ─── Global Search ────────────────────────────────────────────────────────────
router.get(
  '/search',
  requirePermission('agencies.read'),
  validate(globalSearchSchema, 'query'),
  asyncHandler((req, res) => searchController.globalSearch(req, res)),
);

// ─── Contacts (nested under agency) ──────────────────────────────────────────
router.post(
  '/agencies/:agencyId/contacts',
  requirePermission('agencies.write'),
  validate(createContactSchema),
  asyncHandler((req, res) => contactController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/contacts',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => contactController.list(req, res)),
);
router.get(
  '/contacts/:id',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => contactController.getById(req, res)),
);
router.put(
  '/contacts/:id',
  requirePermission('agencies.write'),
  validate(updateContactSchema),
  asyncHandler((req, res) => contactController.update(req, res)),
);
router.delete(
  '/contacts/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => contactController.delete(req, res)),
);
router.patch(
  '/contacts/:id/primary',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => contactController.setPrimary(req, res)),
);

// ─── Activities ───────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/activities',
  requirePermission('agencies.write'),
  validate(createActivitySchema),
  asyncHandler((req, res) => activityController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/activities',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => activityController.list(req, res)),
);
router.get(
  '/activities/:id',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => activityController.getById(req, res)),
);
router.put(
  '/activities/:id',
  requirePermission('agencies.write'),
  validate(updateActivitySchema),
  asyncHandler((req, res) => activityController.update(req, res)),
);
router.delete(
  '/activities/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => activityController.delete(req, res)),
);

// ─── Notes ────────────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/notes',
  requirePermission('agencies.write'),
  validate(createNoteSchema),
  asyncHandler((req, res) => noteController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/notes',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => noteController.list(req, res)),
);
router.put(
  '/notes/:id',
  requirePermission('agencies.write'),
  validate(updateNoteSchema),
  asyncHandler((req, res) => noteController.update(req, res)),
);
router.delete(
  '/notes/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => noteController.delete(req, res)),
);
router.patch(
  '/notes/:id/pin',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => noteController.togglePin(req, res)),
);

// ─── Tasks ────────────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/tasks',
  requirePermission('agencies.write'),
  validate(createTaskSchema),
  asyncHandler((req, res) => taskController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/tasks',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => taskController.list(req, res)),
);
router.put(
  '/tasks/:id',
  requirePermission('agencies.write'),
  validate(updateTaskSchema),
  asyncHandler((req, res) => taskController.update(req, res)),
);
router.delete(
  '/tasks/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => taskController.delete(req, res)),
);
router.patch(
  '/tasks/:id/complete',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => taskController.complete(req, res)),
);

// ─── Follow-ups ───────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/followups',
  requirePermission('agencies.write'),
  validate(createFollowUpSchema),
  asyncHandler((req, res) => followUpController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/followups',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => followUpController.list(req, res)),
);
router.put(
  '/followups/:id',
  requirePermission('agencies.write'),
  validate(updateFollowUpSchema),
  asyncHandler((req, res) => followUpController.update(req, res)),
);
router.delete(
  '/followups/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => followUpController.delete(req, res)),
);
router.patch(
  '/followups/:id/complete',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => followUpController.complete(req, res)),
);

// ─── Timeline ─────────────────────────────────────────────────────────────────
router.get(
  '/agencies/:agencyId/timeline',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => timelineController.getForAgency(req, res)),
);

export default router;
