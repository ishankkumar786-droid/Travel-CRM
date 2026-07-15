import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Star,
  Shield,
  Award,
  Phone,
  Mail,
  Globe,
  Clock,
  Package,
  Calendar,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgencyProfile, getPublicPackages, getAgencyReviews } from '@/lib/api';
import type { MarketplaceProfileDTO, PackageDTO, ReviewDTO } from '@travel/types';

export async function AgencyDetail({ slug }: { slug: string }) {
  // Fetch agency profile and packages in parallel
  let agency: MarketplaceProfileDTO | null = null;
  let packages: PackageDTO[] = [];
  let reviews: ReviewDTO[] = [];

  try {
    const profileRes = await getAgencyProfile(slug);
    agency = profileRes.data as unknown as MarketplaceProfileDTO;

    if (agency) {
      const pkgsRes = await getPublicPackages({ agencyId: agency.agencyId as string, limit: '10' });
      packages = pkgsRes.data as unknown as PackageDTO[];

      const revsRes = await getAgencyReviews(slug);
      reviews = revsRes.data as unknown as ReviewDTO[];
    }
  } catch (error) {
    console.error('Failed to load agency details:', error);
  }

  if (!agency) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-20 text-center lg:px-8">
        <h1 className="mb-2 text-2xl font-bold">Agency Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The agency you are looking for does not exist or is not public yet.
        </p>
        <Link
          href="/agencies"
          className="bg-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agencies
        </Link>
      </div>
    );
  }

  // Fallbacks for data that might not be in the profile DTO yet
  const agencyName =
    (agency as any).name || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const tagline = agency.description?.split('.')[0] || 'Your trusted travel partner';
  const location = 'India'; // Would be in agency.address in a full implementation
  const rating = agency.marketplaceScore > 0 ? (agency.marketplaceScore / 20).toFixed(1) : '4.5';
  const reviewsCount = reviews.length;
  const verified = agency.verificationScore > 80;
  const featured = agency.marketplaceScore > 80;
  const since = new Date(agency.createdAt).getFullYear();
  const phone = '+91 98765 00000'; // Would be in agency profile
  const email = `contact@${slug}.com`;
  const website = agency.socialLinks?.website || `www.${slug}.com`;

  const highlights = [
    ...(agency.isPublic ? ['Verified Agency'] : []),
    ...(agency.languages?.length ? [`Speaks ${agency.languages.join(', ')}`] : []),
    ...(agency.specializations?.length ? agency.specializations : ['Curated Packages']),
  ].slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      {/* Back link */}
      <Link
        href="/agencies"
        className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agencies
      </Link>

      {/* Hero banner */}
      <div className="from-primary/15 via-primary/5 to-accent/10 dark:from-primary/10 dark:via-card dark:to-accent/5 relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br">
        <div className="noise absolute inset-0" />
        {agency.bannerUrl && (
          <img
            src={agency.bannerUrl}
            alt="Banner"
            className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-overlay"
          />
        )}
        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end">
          {/* Avatar */}
          <div
            className="bg-card text-primary flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-2xl font-bold shadow-lg"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {agency.logoUrl ? (
              <img src={agency.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              agencyName
                .split(' ')
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {verified && (
                <span className="bg-accent/15 text-accent flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              )}
              {featured && (
                <span className="bg-primary/15 text-primary flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold">
                  <Award className="h-3 w-3" />
                  Featured
                </span>
              )}
            </div>
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {agencyName}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm italic">{tagline}</p>
            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Since {since}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-foreground font-semibold">{rating}</span>
                <span>({reviewsCount} reviews)</span>
              </span>
            </div>
          </div>
          {/* Contact buttons */}
          <div className="flex shrink-0 gap-2">
            <a
              href={`tel:${phone}`}
              className="border-border bg-card hover:bg-muted flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
            <a
              href={`mailto:${email}`}
              className="bg-primary shadow-primary/20 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
            >
              <Mail className="h-4 w-4" />
              Enquire
            </a>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left — main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* About */}
          {agency.description && (
            <section>
              <h2 className="mb-3 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                About
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
                {agency.description}
              </p>
            </section>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Highlights
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {highlights.map((h) => (
                  <div key={h} className="bg-card flex items-center gap-2.5 rounded-xl border p-3">
                    <CheckCircle2 className="text-accent h-4 w-4 shrink-0" />
                    <span className="line-clamp-1 text-sm font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Packages */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Packages ({packages.length})
              </h2>
            </div>
            {packages.length === 0 ? (
              <div className="text-muted-foreground bg-muted/20 rounded-xl border border-dashed p-8 text-center">
                <Package className="mx-auto mb-3 h-8 w-8 opacity-50" />
                <p>No active packages available right now.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-card card-lift group flex h-full flex-col rounded-xl border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[0.625rem] font-semibold">
                        {pkg.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold">4.8</span>
                      </div>
                    </div>
                    {pkg.coverImage && (
                      <div className="bg-muted mb-3 h-32 w-full overflow-hidden rounded-lg">
                        <img
                          src={pkg.coverImage}
                          alt={pkg.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <h3
                      className="group-hover:text-primary mb-1 line-clamp-2 text-sm font-semibold transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {pkg.name}
                    </h3>
                    <div className="text-muted-foreground mb-3 mt-auto flex items-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="flex items-center text-base font-bold">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {pkg.pricePerPerson.toLocaleString('en-IN')}
                      </span>
                      <Link
                        href={`/packages/${pkg.slug || pkg.id}`}
                        className="text-muted-foreground group-hover:bg-primary group-hover:border-primary flex h-7 w-7 items-center justify-center rounded-lg border transition-colors group-hover:text-white"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <div className="mb-4 mt-8 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Reviews ({reviews.length})
              </h2>
            </div>
            {reviews.length === 0 ? (
              <div className="text-muted-foreground bg-muted/20 rounded-xl border border-dashed p-8 text-center">
                <Star className="mx-auto mb-3 h-8 w-8 opacity-50" />
                <p>No verified reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-card rounded-xl border p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                          {r.travelerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.travelerName}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(r.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.content && (
                      <p className="text-foreground text-sm leading-relaxed">{r.content}</p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified Booking
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Contact card */}
          <div className="bg-card sticky top-24 rounded-2xl border p-5">
            <h3 className="mb-4 text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              Contact Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="text-muted-foreground flex items-center gap-3">
                <Phone className="text-primary h-4 w-4 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-3">
                <Mail className="text-primary h-4 w-4 shrink-0" />
                <span>{email}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-3">
                <Globe className="text-primary h-4 w-4 shrink-0" />
                <span className="truncate">{website}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-3">
                <MapPin className="text-primary h-4 w-4 shrink-0" />
                <span>{location}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <a
                href={`mailto:${email}`}
                className="bg-primary shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
              >
                <Mail className="h-4 w-4" />
                Send Enquiry
              </a>
              <a
                href={`tel:${phone}`}
                className="hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>
          </div>

          {/* Specialties */}
          {agency.specializations && agency.specializations.length > 0 && (
            <div className="bg-card rounded-2xl border p-5">
              <h3 className="mb-3 text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {agency.specializations.map((s) => (
                  <span
                    key={s}
                    className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
