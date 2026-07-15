import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const DESTINATIONS = [
  { name: 'Goa', tagline: 'Beaches & Sunsets', count: 42, img: '🏖️', color: 'from-amber-500 to-orange-600' },
  { name: 'Kerala', tagline: 'Backwaters & Spices', count: 38, img: '🌴', color: 'from-emerald-500 to-green-700' },
  { name: 'Rajasthan', tagline: 'Forts & Heritage', count: 35, img: '🏰', color: 'from-rose-500 to-red-700' },
  { name: 'Manali', tagline: 'Mountains & Snow', count: 29, img: '🏔️', color: 'from-sky-400 to-indigo-600' },
  { name: 'Andaman', tagline: 'Islands & Coral', count: 24, img: '🐚', color: 'from-cyan-400 to-teal-600' },
  { name: 'Ladakh', tagline: 'High Passes & Lakes', count: 18, img: '⛰️', color: 'from-violet-500 to-purple-700' },
];

export function Destinations() {
  return (
    <section id="destinations" className="section">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}
        <div className="section-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="section-label">Popular Destinations</span>
            <h2 className="section-title">Where Will You Go Next?</h2>
            <p className="section-subtitle">
              Hand-picked destinations with curated packages from local experts.
            </p>
          </div>
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            View all destinations
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grid — editorial layout: 2 large + 4 small */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {DESTINATIONS.map((dest, i) => {
            const isLarge = i < 2;
            return (
              <Link
                key={dest.name}
                href={`/packages?destination=${dest.name}`}
                className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl card-lift ${
                  isLarge ? 'lg:col-span-2 lg:row-span-1 h-64 sm:h-72' : 'h-48 sm:h-56'
                }`}
              >
                {/* Gradient BG */}
                <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 overlay-warm" />

                {/* Emoji decoration */}
                <div className="absolute top-4 right-5 text-5xl opacity-20 group-hover:opacity-35 transition-all duration-500 group-hover:scale-110">
                  {dest.img}
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 sm:p-6">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-white/60 mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                    {dest.tagline}
                  </p>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">{dest.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-white/50" style={{ fontFamily: 'var(--font-sans)' }}>
                      {dest.count} packages
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-all group-hover:bg-white group-hover:text-gray-900">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
