import Link from 'next/link';
import {
  ArrowLeft, MapPin, Star, Shield, Award, Phone, Mail,
  Globe, Clock, Package, Calendar, IndianRupee,
  ArrowRight, CheckCircle2,
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
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">Agency Not Found</h1>
        <p className="text-muted-foreground mb-6">The agency you are looking for does not exist or is not public yet.</p>
        <Link href="/agencies" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Back to Agencies
        </Link>
      </div>
    );
  }

  // Fallbacks for data that might not be in the profile DTO yet
  const agencyName = (agency as any).name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8">
      {/* Back link */}
      <Link href="/agencies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Agencies
      </Link>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 dark:from-primary/10 dark:via-card dark:to-accent/5 mb-8">
        <div className="absolute inset-0 noise" />
        {agency.bannerUrl && (
          <img src={agency.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
        )}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end gap-6 p-6 sm:p-8">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-card border shadow-lg text-2xl font-bold text-primary shrink-0 overflow-hidden" style={{ fontFamily: 'var(--font-display)' }}>
            {agency.logoUrl ? (
              <img src={agency.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              agencyName.split(' ').map((w: string) => w[0]).slice(0, 2).join('')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {verified && (
                <span className="flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-accent">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>
              )}
              {featured && (
                <span className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
                  <Award className="h-3 w-3" />
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
              {agencyName}
            </h1>
            <p className="text-sm text-muted-foreground italic mt-0.5">{tagline}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Since {since}</span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-foreground">{rating}</span>
                <span>({reviewsCount} reviews)</span>
              </span>
            </div>
          </div>
          {/* Contact buttons */}
          <div className="flex gap-2 shrink-0">
            <a href={`tel:${phone}`} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              <Phone className="h-4 w-4" />
              Call
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all">
              <Mail className="h-4 w-4" />
              Enquire
            </a>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          {agency.description && (
            <section>
              <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{agency.description}</p>
            </section>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Highlights</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2.5 rounded-xl border bg-card p-3">
                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-sm font-medium line-clamp-1">{h}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Packages */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Packages ({packages.length})
              </h2>
            </div>
            {packages.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                <Package className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No active packages available right now.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl border bg-card p-4 card-lift group flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[0.625rem] font-semibold text-primary">{pkg.category}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold">4.8</span>
                      </div>
                    </div>
                    {pkg.coverImage && (
                      <div className="mb-3 h-32 w-full overflow-hidden rounded-lg bg-muted">
                        <img src={pkg.coverImage} alt={pkg.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    )}
                    <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>{pkg.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mt-auto">
                      <Clock className="h-3 w-3" />{pkg.durationDays}D / {pkg.durationNights}N
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="flex items-center text-base font-bold">
                        <IndianRupee className="h-3.5 w-3.5" />{pkg.pricePerPerson.toLocaleString('en-IN')}
                      </span>
                      <Link href={`/packages/${pkg.slug || pkg.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg border text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
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
            <div className="flex items-center justify-between mb-4 mt-8">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Reviews ({reviews.length})
              </h2>
            </div>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                <Star className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No verified reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {r.travelerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{r.travelerName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                    </div>
                    {r.content && <p className="text-sm text-foreground leading-relaxed">{r.content}</p>}
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
          <div className="rounded-2xl border bg-card p-5 sticky top-24">
            <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{website}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{location}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <a href={`mailto:${email}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:brightness-110 transition-all">
                <Mail className="h-4 w-4" />
                Send Enquiry
              </a>
              <a href={`tel:${phone}`} className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>
          </div>

          {/* Specialties */}
          {agency.specializations && agency.specializations.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {agency.specializations.map((s) => (
                  <span key={s} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
