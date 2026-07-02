import {
  createCatalogItemSchema,
  createDestinationSchema,
  createPackageSchema,
  updateMarketplaceProfileSchema,
  updateOnboardingStageSchema,
  updatePackageSchema,
} from '@travel/validation';
import { Router } from 'express';

import {
  catalogController,
  destinationController,
  marketplaceProfileController,
  onboardingController,
  packageController,
} from '@/controllers/marketplace.controller';
import { authenticate, requirePermission } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

router.use(authenticate);

// ─── Onboarding ───────────────────────────────────────────────────────────────
router.get(
  '/onboarding',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => onboardingController.list(req, res)),
);
router.get(
  '/agencies/:agencyId/onboarding',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => onboardingController.get(req, res)),
);
router.put(
  '/agencies/:agencyId/onboarding/stage',
  requirePermission('agencies.write'),
  validate(updateOnboardingStageSchema),
  asyncHandler((req, res) => onboardingController.updateStage(req, res)),
);

// ─── Marketplace Profile ──────────────────────────────────────────────────────
router.get(
  '/agencies/:agencyId/marketplace-profile',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => marketplaceProfileController.get(req, res)),
);
router.put(
  '/agencies/:agencyId/marketplace-profile',
  requirePermission('agencies.write'),
  validate(updateMarketplaceProfileSchema),
  asyncHandler((req, res) => marketplaceProfileController.update(req, res)),
);
router.get(
  '/agencies/:agencyId/marketplace-readiness',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => marketplaceProfileController.getReadiness(req, res)),
);

// ─── Packages ─────────────────────────────────────────────────────────────────
router.post(
  '/agencies/:agencyId/packages',
  requirePermission('agencies.write'),
  validate(createPackageSchema),
  asyncHandler((req, res) => packageController.create(req, res)),
);
router.get(
  '/agencies/:agencyId/packages',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => packageController.list(req, res)),
);
router.get(
  '/packages/:id',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => packageController.getById(req, res)),
);
router.put(
  '/packages/:id',
  requirePermission('agencies.write'),
  validate(updatePackageSchema),
  asyncHandler((req, res) => packageController.update(req, res)),
);
router.delete(
  '/packages/:id',
  requirePermission('agencies.write'),
  asyncHandler((req, res) => packageController.delete(req, res)),
);

// ─── Destinations ─────────────────────────────────────────────────────────────
router.get(
  '/destinations',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => destinationController.list(req, res)),
);
router.post(
  '/destinations',
  requirePermission('settings.manage'),
  validate(createDestinationSchema),
  asyncHandler((req, res) => destinationController.create(req, res)),
);
router.get(
  '/destinations/:slug',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => destinationController.getBySlug(req, res)),
);
router.delete(
  '/destinations/:id',
  requirePermission('settings.manage'),
  asyncHandler((req, res) => destinationController.delete(req, res)),
);

// ─── Catalog ──────────────────────────────────────────────────────────────────
router.get(
  '/catalog',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => catalogController.getAll(req, res)),
);
router.get(
  '/catalog/list',
  requirePermission('agencies.read'),
  asyncHandler((req, res) => catalogController.list(req, res)),
);
router.post(
  '/catalog',
  requirePermission('settings.manage'),
  validate(createCatalogItemSchema),
  asyncHandler((req, res) => catalogController.create(req, res)),
);
router.delete(
  '/catalog/:id',
  requirePermission('settings.manage'),
  asyncHandler((req, res) => catalogController.delete(req, res)),
);

export default router;
