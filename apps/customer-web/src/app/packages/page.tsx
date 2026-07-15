import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PackagesList } from '@/components/packages/PackagesList';

export const metadata = {
  title: 'Travel Packages | TravelMarket',
  description: 'Explore and book curated travel packages from verified agencies across India.',
};

export default function PackagesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 pt-24">
        <PackagesList searchParams={searchParams} />
      </main>
      <Footer />
    </>
  );
}
