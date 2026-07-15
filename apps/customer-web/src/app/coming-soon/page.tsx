import Link from 'next/link';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata = { title: 'Coming Soon | TravelMarket' };

export default function ComingSoonPage() {
  return (
    <>
      <Navbar />
      <main className="mt-16 flex min-h-[80vh] flex-col items-center justify-center px-5 py-24 text-center">
        <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
          <Rocket className="h-10 w-10" />
        </div>

        <h1
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Coming Soon
        </h1>

        <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
          We're working hard to bring this feature to life. Check back soon to see what we've been
          building!
        </p>

        <Link
          href="/"
          className="bg-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
