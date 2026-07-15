import type { Metadata } from 'next';
import { ReviewsContent } from '@/components/reviews/ReviewsContent';

export const metadata: Metadata = { title: 'Reviews' };

export default function ReviewsPage() {
  return <ReviewsContent />;
}
