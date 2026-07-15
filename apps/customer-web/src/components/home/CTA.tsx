import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="noise relative overflow-hidden rounded-3xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
          <div className="bg-primary/20 absolute bottom-0 right-0 h-64 w-64 rounded-full blur-[100px]" />
          <div className="bg-accent/15 absolute left-1/4 top-0 h-48 w-48 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center px-8 py-16 text-center md:px-16 md:py-20">
            <span
              className="text-primary mb-4 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Start Your Journey
            </span>
            <h2 className="max-w-lg text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.75rem]">
              Ready for an Unforgettable Adventure?
            </h2>
            <p
              className="mt-5 max-w-md text-base leading-relaxed text-white/55"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Browse verified agencies, compare packages, and book your perfect trip — all in one
              place.
            </p>
            <div
              className="mt-10 flex flex-col gap-3 sm:flex-row"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <Link
                href="/packages"
                className="bg-primary shadow-primary/25 inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110"
              >
                Explore Packages
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/agencies"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
              >
                Find Agencies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
