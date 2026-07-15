import { Router } from 'express';

import { reviewController } from '@/controllers/review.controller';
import { authenticate } from '@/middleware/auth';
import { asyncHandler } from '@/utils';

const router: Router = Router();

router.use(authenticate);

router.post(
  '/request',
  asyncHandler((req, res) => reviewController.requestReview(req, res)),
);
router.get(
  '/',
  asyncHandler((req, res) => reviewController.getAgencyReviews(req, res)),
);

export default router;
