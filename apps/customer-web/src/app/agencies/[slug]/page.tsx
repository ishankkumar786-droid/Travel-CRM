import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AgencyDetail } from '@/components/agencies/AgencyDetail';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: name,
    description: `View packages and reviews for ${name} — a verified travel agency on TravelMarket.`,
  };
}

export default function AgencyDetailPage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <AgencyDetail slug={params.slug} />
      </main>
      <Footer />
    </>
  );
}
