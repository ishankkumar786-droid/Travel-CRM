import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReviewSubmission } from '@/components/reviews/ReviewSubmission';

export const metadata: Metadata = { title: 'Submit Review | TravelMarket' };

export default function ReviewPage({ params }: { params: { token: string } }) {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen bg-muted/30">
        <ReviewSubmission token={params.token} />
      </main>
      <Footer />
    </>
  );
}
