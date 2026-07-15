import { Router } from 'express';
import { reviewController } from '@/controllers/review.controller';
import { asyncHandler } from '@/utils';
import { authenticate } from '@/middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/request', asyncHandler(reviewController.requestReview));
router.get('/', asyncHandler(reviewController.getAgencyReviews));

export default router;
