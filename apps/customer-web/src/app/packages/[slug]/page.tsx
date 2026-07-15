import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PackageDetail } from '@/components/packages/PackageDetail';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${name} | TravelMarket`,
    description: `View details, itinerary, and pricing for ${name} on TravelMarket.`,
  };
}

export default function PackagePage({ params }: Props) {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-16">
        <PackageDetail slug={params.slug} />
      </main>
      <Footer />
    </>
  );
}
