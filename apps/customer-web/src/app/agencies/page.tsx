import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AgenciesContent } from '@/components/agencies/AgenciesContent';

export const metadata: Metadata = {
  title: 'Browse Agencies',
  description: 'Find verified travel agencies across India. Filter by destination, ratings, and more.',
};

export default function AgenciesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <AgenciesContent />
      </main>
      <Footer />
    </>
  );
}
