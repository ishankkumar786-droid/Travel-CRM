import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, MapPin, Clock, IndianRupee, Star,
  CheckCircle2, XCircle, CalendarDays, Package, Shield,
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
        <Link href={`/agencies/${agencySlug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Agency
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            {pkg.category}
          </span>
          <div className="flex items-center gap-1 rounded-md bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">4.8</span>
            <span className="text-xs text-yellow-600/70 dark:text-yellow-500/70">(128 reviews)</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold sm:text-4xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          {pkg.name}
        </h1>
        
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{pkg.destinationName || 'Multiple Locations'}</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-muted aspect-video md:aspect-[21/9]">
        {pkg.coverImage ? (
          <img src={pkg.coverImage} alt={pkg.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-20 w-20 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Floating Price Card on Desktop */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:right-auto md:w-[320px] rounded-xl bg-white/95 dark:bg-card/95 backdrop-blur-sm p-5 shadow-xl">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Starting from</p>
            <div className="flex items-baseline gap-2">
              <span className="flex items-center text-2xl font-bold text-foreground">
                <IndianRupee className="h-5 w-5" />{pkg.pricePerPerson.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-muted-foreground line-through">₹{oldPrice.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[0.625rem] text-muted-foreground mt-0.5">per person, twin sharing</p>
          </div>
          <Link href={`/agencies/${agencySlug}`} className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all md:hidden">
            Book
          </Link>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Itinerary */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <CalendarDays className="h-6 w-6 text-primary" />
                Detailed Itinerary
              </h2>
              <div className="space-y-6">
                {pkg.itinerary.map((day, index) => (
                  <div key={index} className="relative pl-10">
                    {/* Timeline line */}
                    {index < pkg.itinerary!.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-sm z-10">
                      {day.day}
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                      <h3 className="font-bold text-lg mb-2">{day.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inclusions & Exclusions */}
          <section className="grid sm:grid-cols-2 gap-6">
            {pkg.inclusions.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {pkg.inclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {pkg.exclusions.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Not Included
                </h3>
                <ul className="space-y-3">
                  {pkg.exclusions.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
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
        <div className="hidden md:block space-y-6">
          <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Book this package</h3>
            <p className="text-sm text-muted-foreground mb-6">Contact the agency to customize and book this experience.</p>
            
            <Link href={`/agencies/${agencySlug}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all">
              Contact Agency
            </Link>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Book securely via TravelMarket
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
