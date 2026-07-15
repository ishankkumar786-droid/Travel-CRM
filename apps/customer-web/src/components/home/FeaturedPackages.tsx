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
    <div className="group rounded-2xl border bg-card overflow-hidden card-lift flex flex-col h-full">
      {/* Image area */}
      <div className="relative h-52 bg-gradient-to-br from-muted to-muted/50 overflow-hidden shrink-0">
        {pkg.coverImage ? (
          <img src={pkg.coverImage} alt={pkg.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="rounded-md px-2.5 py-1 text-[0.6875rem] font-semibold bg-primary text-white shadow-sm">
            {pkg.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 rounded-md bg-accent px-2 py-0.5 text-[0.6875rem] font-bold text-accent-foreground shadow-sm">
          {discount}% OFF
        </div>
        {/* Hover */}
        <Link href={`/packages/${pkg.slug || pkg.id}`} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg scale-95 group-hover:scale-100 transition-transform">
            View Details
          </span>
        </Link>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={`/packages/${pkg.slug || pkg.id}`} className="block">
            <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
              {pkg.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 shrink-0 rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">4.8</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 mt-2">
          <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{pkg.destinationName || 'Multiple'}</span>
          <span className="flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" />{pkg.durationDays}D / {pkg.durationNights}N</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="flex items-center text-lg font-bold text-foreground">
                <IndianRupee className="h-3.5 w-3.5" />{pkg.pricePerPerson.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground line-through">₹{oldPrice.toLocaleString('en-IN')}</span>
            </div>
            <span className="text-[0.625rem] text-muted-foreground">per person</span>
          </div>
          <Link href={`/packages/${pkg.slug || pkg.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-white hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary">
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
        <div className="section-header flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="section-label">Featured Packages</span>
            <h2 className="section-title">Handpicked For You</h2>
            <p className="section-subtitle">
              The most popular packages this season, verified and rated by real travelers.
            </p>
          </div>
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-primary hover:text-white hover:border-primary"
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
