import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PackagesList } from '@/components/packages/PackagesList';

export const metadata = {
  title: 'Travel Packages | TravelMarket',
  description: 'Explore and book curated travel packages from verified agencies across India.',
};

export default function PackagesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen">
        <PackagesList searchParams={searchParams} />
      </main>
      <Footer />
    </>
  );
}
