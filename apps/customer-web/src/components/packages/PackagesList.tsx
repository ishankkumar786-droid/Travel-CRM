import Link from 'next/link';
import { getPublicPackages } from '@/lib/api';
import { Package, Star, MapPin, Clock, IndianRupee, ArrowRight, Filter } from 'lucide-react';
import type { PackageDTO } from '@travel/types';

export async function PackagesList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  let packages: PackageDTO[] = [];
  let totalPages = 1;
  let totalItems = 0;

  try {
    const params: Record<string, string> = { limit: '12' };
    
    if (typeof searchParams.destination === 'string') params.destination = searchParams.destination;
    if (typeof searchParams.category === 'string') params.category = searchParams.category;
    if (typeof searchParams.page === 'string') params.page = searchParams.page;

    const res = await getPublicPackages(params);
    if (res.data) {
      packages = res.data as unknown as PackageDTO[];
      totalPages = res.pagination?.totalPages || 1;
      totalItems = res.pagination?.total || 0;
    }
  } catch (error) {
    console.error('Failed to load packages:', error);
  }

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Explore Packages
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Discover curated travel experiences from verified agencies across India. Find your next adventure, relaxing getaway, or cultural tour.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Showing {packages.length} of {totalItems} results</span>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center flex flex-col items-center bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-bold mb-2">No packages found</h2>
          <p className="text-muted-foreground max-w-md">We couldn't find any travel packages matching your criteria right now. Try exploring other destinations.</p>
          <Link href="/" className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => {
            const oldPrice = pkg.pricePerPerson * 1.2;
            const discount = Math.round(((oldPrice - pkg.pricePerPerson) / oldPrice) * 100);

            return (
              <div key={pkg.id} className="group rounded-2xl border bg-card overflow-hidden card-lift flex flex-col h-full">
                {/* Image area */}
                <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden shrink-0">
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
                      <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                        {pkg.name}
                      </h3>
                    </Link>
                  </div>
                  
                  {/* Temporary fixed rating since we don't have reviews implemented yet */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
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
          })}
        </div>
      )}
    </div>
  );
}
