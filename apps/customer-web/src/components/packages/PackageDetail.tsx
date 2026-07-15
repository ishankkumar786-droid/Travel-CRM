import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Package,
  Shield,
} from 'lucide-react';
import { getPublicPackage, getAgencyProfile } from '@/lib/api';
import type { PackageDTO, MarketplaceProfileDTO } from '@travel/types';

export async function PackageDetail({ slug }: { slug: string }) {
  let pkg: PackageDTO | null = null;

  try {
    const res = await getPublicPackage(slug);
    if (res.data) {
      pkg = res.data as unknown as PackageDTO;
    }
  } catch (error) {
    console.error('Failed to load package:', error);
  }

  if (!pkg) {
    return notFound();
  }

  let agencySlug = pkg.agencyId;
  try {
    const profileRes = await getAgencyProfile(pkg.agencyId);
    if (profileRes.data) {
      const profile = profileRes.data as unknown as MarketplaceProfileDTO;
      agencySlug = profile.publicSlug || pkg.agencyId;
    }
  } catch (error) {
    console.error('Failed to load agency profile for link:', error);
  }

  const oldPrice = pkg.pricePerPerson * 1.2;

  return (
    <div className="mx-auto max-w-5xl px-5 lg:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/agencies/${agencySlug}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agency
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-semibold">
            {pkg.category}
          </span>
          <div className="flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 dark:bg-yellow-900/20">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">4.8</span>
            <span className="text-xs text-yellow-600/70 dark:text-yellow-500/70">
              (128 reviews)
            </span>
          </div>
        </div>

        <h1
          className="mb-4 text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {pkg.name}
        </h1>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <span className="flex items-center gap-2">
            <MapPin className="text-primary h-4 w-4" />
            {pkg.destinationName || 'Multiple Locations'}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="text-primary h-4 w-4" />
            {pkg.durationDays} Days / {pkg.durationNights} Nights
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-muted relative mb-10 aspect-video overflow-hidden rounded-2xl md:aspect-[21/9]">
        {pkg.coverImage ? (
          <img
            src={pkg.coverImage}
            alt={pkg.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="text-muted-foreground/20 h-20 w-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Floating Price Card on Desktop */}
        <div className="dark:bg-card/95 absolute bottom-6 left-6 right-6 flex items-end justify-between rounded-xl bg-white/95 p-5 shadow-xl backdrop-blur-sm md:right-auto md:w-[320px]">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Starting from</p>
            <div className="flex items-baseline gap-2">
              <span className="text-foreground flex items-center text-2xl font-bold">
                <IndianRupee className="h-5 w-5" />
                {pkg.pricePerPerson.toLocaleString('en-IN')}
              </span>
              <span className="text-muted-foreground text-sm line-through">
                ₹{oldPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-[0.625rem]">per person, twin sharing</p>
          </div>
          <Link
            href={`/agencies/${agencySlug}`}
            className="bg-primary inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 md:hidden"
          >
            Book
          </Link>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-10 md:col-span-2">
          {/* Itinerary */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <section>
              <h2
                className="mb-6 flex items-center gap-2 text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <CalendarDays className="text-primary h-6 w-6" />
                Detailed Itinerary
              </h2>
              <div className="space-y-6">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Timeline line */}
                    {index < pkg.itinerary!.length - 1 && (
                      <div className="bg-border absolute bottom-[-24px] left-[15px] top-8 w-[2px]" />
                    )}
                    {/* Timeline dot */}
                    <div className="bg-primary text-primary-foreground absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm">
                      {day.day}
                    </div>
                    <div className="bg-card rounded-xl border p-5">
                      <h3 className="mb-2 text-lg font-bold">{day.title}</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions & Exclusions */}
          <section className="grid gap-6 sm:grid-cols-2">
            {pkg.inclusions.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map((item, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pkg.exclusions.length > 0 && (
              <div className="bg-card rounded-xl border p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Not Included
                </h3>
                <ul className="space-y-3">
                  {pkg.exclusions.map((item, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="hidden space-y-6 md:block">
          <div className="bg-card sticky top-24 rounded-2xl border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Book this package
            </h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Contact the agency to customize and book this experience.
            </p>

            <Link
              href={`/agencies/${agencySlug}`}
              className="bg-primary shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
            >
              Contact Agency
            </Link>

            <div className="text-muted-foreground mt-4 flex items-center justify-center gap-2 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Book securely via TravelMarket
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
