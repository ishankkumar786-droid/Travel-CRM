import { Star, Clock, MapPin, IndianRupee, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getPublicPackages } from '@/lib/api';

import type { PackageDTO } from '@travel/types';

function PackageCard({ pkg }: { pkg: PackageDTO }) {
  // We can calculate a fake discount if old price is needed, or just display actual price
  const oldPrice = pkg.pricePerPerson * 1.2;
  const discount = Math.round(((oldPrice - pkg.pricePerPerson) / oldPrice) * 100);

  return (
    <div className="bg-card card-lift group flex h-full flex-col overflow-hidden rounded-2xl border">
      {/* Image area */}
      <div className="from-muted to-muted/50 relative h-52 shrink-0 overflow-hidden bg-gradient-to-br">
        {pkg.coverImage ? (
          <img
            src={pkg.coverImage}
            alt={pkg.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="text-muted-foreground/20 h-12 w-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="bg-primary rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold text-white shadow-sm">
            {pkg.category}
          </span>
        </div>
        <div className="bg-accent text-accent-foreground absolute right-3 top-3 rounded-md px-2 py-0.5 text-[0.6875rem] font-bold shadow-sm">
          {discount}% OFF
        </div>
        {/* Hover */}
        <Link
          href={`/packages/${pkg.slug || pkg.id}`}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          <span className="scale-95 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg transition-transform group-hover:scale-100">
            View Details
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <Link href={`/packages/${pkg.slug || pkg.id}`} className="block">
            <h3
              className="text-foreground group-hover:text-primary line-clamp-1 text-base font-semibold leading-snug transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {pkg.name}
            </h3>
          </Link>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-yellow-50 px-1.5 py-0.5 dark:bg-yellow-900/20">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">4.8</span>
          </div>
        </div>

        <div className="text-muted-foreground mb-4 mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            {pkg.destinationName || 'Multiple'}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" />
            {pkg.durationDays}D / {pkg.durationNights}N
          </span>
        </div>

        <div className="border-border/50 mt-auto flex items-center justify-between border-t pt-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground flex items-center text-lg font-bold">
                <IndianRupee className="h-3.5 w-3.5" />
                {pkg.pricePerPerson.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground text-xs line-through">
                ₹{oldPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-muted-foreground text-[0.625rem]">per person</span>
          </div>
          <Link
            href={`/packages/${pkg.slug || pkg.id}`}
            className="border-border text-muted-foreground hover:bg-primary hover:border-primary group-hover:bg-primary group-hover:border-primary flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:text-white group-hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function FeaturedPackages() {
  let packages: PackageDTO[] = [];
  try {
    const res = await getPublicPackages({ featured: 'true', limit: '4' });
    packages = res.data as unknown as PackageDTO[];
  } catch (error) {
    console.error('Failed to fetch featured packages:', error);
  }

  if (!packages || packages.length === 0) {
    return null; // Don't show the section if no featured packages exist
  }

  return (
    <section id="packages" className="section bg-muted/30 dark:bg-muted/10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="section-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-label">Featured Packages</span>
            <h2 className="section-title">Handpicked For You</h2>
            <p className="section-subtitle">
              The most popular packages this season, verified and rated by real travelers.
            </p>
          </div>
          <Link
            href="/packages"
            className="hover:bg-primary hover:border-primary inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            All Packages
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}
