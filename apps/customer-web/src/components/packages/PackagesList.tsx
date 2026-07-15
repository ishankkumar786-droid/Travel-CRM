import Link from 'next/link';
import { getPublicPackages } from '@/lib/api';
import { Package, Star, MapPin, Clock, IndianRupee, ArrowRight, Filter } from 'lucide-react';
import type { PackageDTO } from '@travel/types';

export async function PackagesList({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
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
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1
            className="mb-2 text-3xl font-bold sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Explore Packages
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
            Discover curated travel experiences from verified agencies across India. Find your next
            adventure, relaxing getaway, or cultural tour.
          </p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          <span>
            Showing {packages.length} of {totalItems} results
          </span>
        </div>
      </div>

      {packages.length === 0 ? (
        <div className="bg-muted/20 flex flex-col items-center rounded-2xl border border-dashed p-12 text-center">
          <Package className="text-muted-foreground/50 mb-4 h-12 w-12" />
          <h2 className="mb-2 text-lg font-bold">No packages found</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any travel packages matching your criteria right now. Try exploring
            other destinations.
          </p>
          <Link
            href="/"
            className="bg-primary mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => {
            const oldPrice = pkg.pricePerPerson * 1.2;
            const discount = Math.round(((oldPrice - pkg.pricePerPerson) / oldPrice) * 100);

            return (
              <div
                key={pkg.id}
                className="bg-card card-lift group flex h-full flex-col overflow-hidden rounded-2xl border"
              >
                {/* Image area */}
                <div className="from-muted to-muted/50 relative h-48 shrink-0 overflow-hidden bg-gradient-to-br">
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
                        className="text-foreground group-hover:text-primary line-clamp-2 text-base font-semibold leading-snug transition-colors"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {pkg.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Temporary fixed rating since we don't have reviews implemented yet */}
                  <div className="mb-3 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>

                  <div className="text-muted-foreground mb-4 flex items-center gap-3 text-xs">
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
          })}
        </div>
      )}
    </div>
  );
}
