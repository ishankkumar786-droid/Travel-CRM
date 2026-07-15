import { type Request, type Response } from 'express';
import { reviewService } from '@/services/review.service';
import { publicApiService } from '@/services/public-api.service';
import { sendSuccess, sendCreated } from '@/lib/response';
import { AppError } from '@/errors';
import { reviewRequestSchema, submitReviewSchema } from '@travel/validation';
import { User } from '@/models/user.model';
import { Agency } from '@/models/agency.model';

export const reviewController = {
  /**
   * AGENCY ROUTES (Protected)
   */
  async requestReview(req: Request, res: Response) {
    const input = reviewRequestSchema.parse(req.body);
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Unauthorized', 'Unauthorized');
    
    const user = await User.findById(userId);
    let agencyId = user?.agencyId?.toString();
    if (!agencyId) {
      const firstAgency = await Agency.findOne();
      if (!firstAgency) throw new AppError(404, 'Not Found', 'No agencies found');
      agencyId = firstAgency._id.toString();
    }

    const review = await reviewService.createReviewRequest(agencyId, input);
    sendCreated(res, review, 'Review request created successfully');
  },

  async getAgencyReviews(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'Unauthorized', 'Unauthorized');

    const user = await User.findById(userId);
    let agencyId = user?.agencyId?.toString();
    if (!agencyId) {
      const firstAgency = await Agency.findOne();
      if (!firstAgency) throw new AppError(404, 'Not Found', 'No agencies found');
      agencyId = firstAgency._id.toString();
    }

    const reviews = await reviewService.getAgencyReviews(agencyId);
    sendSuccess(res, reviews, 'Agency reviews retrieved');
  },

  /**
   * PUBLIC ROUTES
   */
  async getReviewByToken(req: Request, res: Response) {
    const { token } = req.params;
    const review = await reviewService.getReviewByToken(token as string);
    sendSuccess(res, review, 'Review link verified');
  },

  async submitReview(req: Request, res: Response) {
    const { token } = req.params;
    const input = submitReviewSchema.parse(req.body);
    
    const review = await reviewService.submitReview(token as string, input);
    sendSuccess(res, review, 'Review submitted successfully');
  },

  async getPublicReviewsForAgency(req: Request, res: Response) {
    const { slug } = req.params;
    
    // First, lookup the agency by slug to get the agencyId
    const profile = await publicApiService.getPublicAgencyProfile(slug as string) as any;
    if (!profile) {
      throw new AppError(404, 'Not Found', 'Agency not found');
    }

    const reviews = await reviewService.getPublicReviewsForAgency(profile.agencyId);
    sendSuccess(res, reviews, 'Public reviews retrieved');
  }
};
