import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReviewSubmission } from '@/components/reviews/ReviewSubmission';

export const metadata: Metadata = { title: 'Submit Review | TravelMarket' };

export default function ReviewPage({ params }: { params: { token: string } }) {
  return (
    <>
      <Navbar />
      <main className="bg-muted/30 min-h-screen pb-16 pt-24">
        <ReviewSubmission token={params.token} />
      </main>
      <Footer />
    </>
  );
}
