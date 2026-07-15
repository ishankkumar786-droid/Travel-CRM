import { Review } from '@/models/review.model';
import { MarketplaceProfile } from '@/models/marketplace-profile.model';
import { AppError } from '@/errors';
import type { ReviewRequestInput, SubmitReviewInput, ReviewDTO } from '@travel/types';

export class ReviewService {
  /**
   * AGENCY ENDPOINTS
   */

  // Create a review request (returns the token/link)
  async createReviewRequest(agencyId: string, input: ReviewRequestInput): Promise<ReviewDTO> {
    const review = new Review({
      agencyId,
      travelerName: input.travelerName,
      travelerEmail: input.travelerEmail,
      packageId: input.packageId,
      status: 'pending',
    });
    
    await review.save();
    return review.toDTO();
  }

  // Get all reviews for an agency (pending, published)
  async getAgencyReviews(agencyId: string): Promise<ReviewDTO[]> {
    const reviews = await Review.find({ agencyId }).sort({ createdAt: -1 }).exec();
    return reviews.map((r) => r.toDTO());
  }

  /**
   * PUBLIC ENDPOINTS
   */

  // Get a review by token (to verify the link is valid before submission)
  async getReviewByToken(token: string): Promise<ReviewDTO> {
    const review = await Review.findOne({ token }).exec();
    if (!review) {
      throw new AppError(404, 'Not Found', 'Review link not found or invalid.');
    }
    return review.toDTO();
  }

  // Submit a review using a valid token
  async submitReview(token: string, input: SubmitReviewInput): Promise<ReviewDTO> {
    const review = await Review.findOne({ token }).exec();
    
    if (!review) {
      throw new AppError(404, 'Not Found', 'Review link not found.');
    }
    
    if (review.status === 'published') {
      throw new AppError(400, 'Bad Request', 'This review has already been submitted.');
    }

    review.rating = input.rating;
    review.content = input.content;
    review.status = 'published';
    await review.save();

    // Fire and forget updating the agency's aggregate scores
    this.updateAgencyReviewStats(review.agencyId.toString()).catch((err) => {
      console.error('Failed to update agency stats after review:', err);
    });

    return review.toDTO();
  }

  // Get published reviews for public display
  async getPublicReviewsForAgency(agencyId: string): Promise<ReviewDTO[]> {
    const reviews = await Review.find({ agencyId, status: 'published' }).sort({ createdAt: -1 }).exec();
    return reviews.map((r) => r.toDTO());
  }

  // Recalculates Trust Score and Updates Marketplace Profile
  private async updateAgencyReviewStats(agencyId: string) {
    const reviews = await Review.find({ agencyId, status: 'published' }).exec();
    
    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // We update trustScore based on reviews. Let's make 5 stars = 100 trust score
    const trustScore = Math.round((avgRating / 5) * 100);

    await MarketplaceProfile.findOneAndUpdate(
      { agencyId },
      { 
        $set: { 
          trustScore,
          // Could also calculate marketplaceScore based on combination of trustScore + profileScore
        }
      }
    ).exec();
  }
}

export const reviewService = new ReviewService();
