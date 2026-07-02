import { Router } from 'express';

import { publicApiController } from '@/controllers/marketplace.controller';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

/**
 * Public API — no authentication required.
 * Read-only endpoints for the future customer-facing marketplace.
 */
const router: ExpressRouter = Router();

// ─── Public agencies ──────────────────────────────────────────────────────────
router.get(
  '/agencies',
  asyncHandler((req, res) => publicApiController.listAgencies(req, res)),
);
router.get(
  '/agencies/:slug/profile',
  asyncHandler((req, res) => publicApiController.getAgencyProfile(req, res)),
);

// ─── Public packages ──────────────────────────────────────────────────────────
router.get(
  '/packages',
  asyncHandler((req, res) => publicApiController.listPackages(req, res)),
);

// ─── Public destinations ──────────────────────────────────────────────────────
router.get(
  '/destinations',
  asyncHandler((req, res) => publicApiController.listDestinations(req, res)),
);

// ─── Recommendations ──────────────────────────────────────────────────────────
router.get(
  '/recommendations',
  asyncHandler((req, res) => publicApiController.getRecommendations(req, res)),
);

export default router;
