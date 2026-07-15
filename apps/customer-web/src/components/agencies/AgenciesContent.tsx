'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  Shield,
  Award,
  ArrowRight,
  Users,
  Package,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Mock agencies (replaced by API in production) ──────────────────────── */
const MOCK_AGENCIES = [
  {
    id: '1',
    slug: 'wanderlust-travels',
    name: 'Wanderlust Travels',
    tagline: 'Your journey, our passion',
    location: 'Mumbai, Maharashtra',
    rating: 4.8,
    reviews: 342,
    packages: 24,
    verified: true,
    featured: true,
    specialties: ['Beach', 'Luxury', 'Honeymoon'],
    since: 2015,
  },
  {
    id: '2',
    slug: 'serene-escapes',
    name: 'Serene Escapes',
    tagline: 'Where peace meets adventure',
    location: 'Delhi, NCR',
    rating: 4.7,
    reviews: 218,
    packages: 18,
    verified: true,
    featured: true,
    specialties: ['Adventure', 'Trekking', 'Group Tours'],
    since: 2018,
  },
  {
    id: '3',
    slug: 'global-nomads',
    name: 'Global Nomads Agency',
    tagline: 'Travel beyond boundaries',
    location: 'Jaipur, Rajasthan',
    rating: 4.6,
    reviews: 156,
    packages: 15,
    verified: true,
    featured: false,
    specialties: ['Cultural', 'Heritage', 'Family'],
    since: 2016,
  },
  {
    id: '4',
    slug: 'mountain-trails',
    name: 'Mountain Trails India',
    tagline: 'Conquer every peak',
    location: 'Manali, Himachal Pradesh',
    rating: 4.9,
    reviews: 89,
    packages: 12,
    verified: true,
    featured: false,
    specialties: ['Trekking', 'Adventure', 'Camping'],
    since: 2019,
  },
  {
    id: '5',
    slug: 'coastal-vibes',
    name: 'Coastal Vibes Tours',
    tagline: 'Life is better at the beach',
    location: 'Goa',
    rating: 4.5,
    reviews: 203,
    packages: 20,
    verified: true,
    featured: true,
    specialties: ['Beach', 'Nightlife', 'Water Sports'],
    since: 2017,
  },
  {
    id: '6',
    slug: 'heritage-walks',
    name: 'Heritage Walks India',
    tagline: 'Stories carved in stone',
    location: 'Udaipur, Rajasthan',
    rating: 4.4,
    reviews: 67,
    packages: 8,
    verified: false,
    featured: false,
    specialties: ['Cultural', 'History', 'Photography'],
    since: 2020,
  },
  {
    id: '7',
    slug: 'backwater-cruises',
    name: 'Backwater Cruises Kerala',
    tagline: 'Drift into serenity',
    location: 'Kochi, Kerala',
    rating: 4.8,
    reviews: 145,
    packages: 14,
    verified: true,
    featured: false,
    specialties: ['Luxury', 'Nature', 'Wellness'],
    since: 2014,
  },
  {
    id: '8',
    slug: 'himalayan-heights',
    name: 'Himalayan Heights',
    tagline: 'Altitude changes everything',
    location: 'Leh, Ladakh',
    rating: 4.7,
    reviews: 98,
    packages: 10,
    verified: true,
    featured: false,
    specialties: ['Adventure', 'Road Trip', 'Photography'],
    since: 2018,
  },
];

const SPECIALTIES = [
  'All',
  'Beach',
  'Adventure',
  'Luxury',
  'Cultural',
  'Trekking',
  'Honeymoon',
  'Family',
  'Group Tours',
];

type SortOption = 'rating' | 'reviews' | 'packages' | 'name';

/* ── Agency Card ─────────────────────────────────────────────────────────── */
function AgencyCard({ agency }: { agency: (typeof MOCK_AGENCIES)[0] }) {
  return (
    <Link
      href={`/agencies/${agency.slug}`}
      className="bg-card card-lift group flex flex-col overflow-hidden rounded-2xl border"
    >
      {/* Header banner */}
      <div className="from-primary/20 via-primary/5 to-accent/10 relative h-28 overflow-hidden bg-gradient-to-br">
        {agency.featured && (
          <div className="bg-primary absolute left-3 top-3 flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-bold text-white">
            <Award className="h-3 w-3" />
            Featured
          </div>
        )}
        {agency.verified && (
          <div className="bg-accent absolute right-3 top-3 flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-bold text-white">
            <Shield className="h-3 w-3" />
            Verified
          </div>
        )}
        {/* Avatar */}
        <div
          className="bg-card border-background text-primary absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center rounded-xl border-2 text-lg font-bold shadow-md"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {agency.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 pt-9">
        <h3
          className="text-foreground group-hover:text-primary text-base font-bold transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {agency.name}
        </h3>
        <p className="text-muted-foreground mt-0.5 text-xs italic">{agency.tagline}</p>
        <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
          <MapPin className="h-3 w-3" />
          {agency.location}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-bold">{agency.rating}</span>
            </div>
            <span className="text-muted-foreground text-[0.625rem]">{agency.reviews} reviews</span>
          </div>
          <div className="border-x text-center">
            <div className="flex items-center justify-center gap-0.5">
              <Package className="text-primary h-3 w-3" />
              <span className="text-sm font-bold">{agency.packages}</span>
            </div>
            <span className="text-muted-foreground text-[0.625rem]">packages</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold">Since</span>
            <p className="text-muted-foreground text-[0.625rem]">{agency.since}</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agency.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[0.625rem] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-5 py-3">
        <span className="text-muted-foreground text-xs">View profile & packages</span>
        <span className="text-muted-foreground group-hover:bg-primary group-hover:border-primary flex h-7 w-7 items-center justify-center rounded-lg border transition-colors group-hover:text-white">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

/* ── Main Content ────────────────────────────────────────────────────────── */
export function AgenciesContent() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_AGENCIES.filter((a) => {
    if (
      search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !a.location.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (specialty !== 'All' && !a.specialties.includes(specialty)) return false;
    if (verifiedOnly && !a.verified) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    if (sortBy === 'packages') return b.packages - a.packages;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Travel Agencies
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg">
          Browse verified travel agencies across India. Each agency is vetted for quality and
          reliability.
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="bg-card focus-within:border-primary/50 flex max-w-sm flex-1 items-center gap-2 rounded-xl border px-3.5 py-2.5 transition-colors">
            <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies or locations…"
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Toggle mobile filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="hover:bg-muted flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Desktop filters */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
              verifiedOnly ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-muted',
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Verified Only
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-card focus:border-primary rounded-lg border px-3 py-2 text-xs font-medium outline-none transition-colors"
          >
            <option value="rating">Sort: Highest Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="packages">Sort: Most Packages</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Mobile filters panel */}
      {showFilters && (
        <div className="bg-card animate-fade-in mb-6 space-y-4 rounded-xl border p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
              verifiedOnly ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-muted',
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Verified Only
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-card w-full rounded-lg border px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="rating">Sort: Highest Rated</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="packages">Sort: Most Packages</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>
      )}

      {/* Specialty pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-all',
              specialty === s
                ? 'bg-primary shadow-primary/20 text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-muted-foreground mb-5 text-sm">
        Showing <span className="text-foreground font-semibold">{filtered.length}</span> agencies
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="text-muted-foreground/30 mb-4 h-12 w-12" />
          <h3 className="mb-1 text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            No agencies found
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Try adjusting your search or filter criteria to see more results.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSpecialty('All');
              setVerifiedOnly(false);
            }}
            className="text-primary mt-4 text-sm font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
