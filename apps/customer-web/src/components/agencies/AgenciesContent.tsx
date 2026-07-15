'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Star, Filter, ChevronDown, Shield, Award,
  ArrowRight, Users, Package, X, SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Mock agencies (replaced by API in production) ──────────────────────── */
const MOCK_AGENCIES = [
  { id: '1', slug: 'wanderlust-travels', name: 'Wanderlust Travels', tagline: 'Your journey, our passion', location: 'Mumbai, Maharashtra', rating: 4.8, reviews: 342, packages: 24, verified: true, featured: true, specialties: ['Beach', 'Luxury', 'Honeymoon'], since: 2015 },
  { id: '2', slug: 'serene-escapes', name: 'Serene Escapes', tagline: 'Where peace meets adventure', location: 'Delhi, NCR', rating: 4.7, reviews: 218, packages: 18, verified: true, featured: true, specialties: ['Adventure', 'Trekking', 'Group Tours'], since: 2018 },
  { id: '3', slug: 'global-nomads', name: 'Global Nomads Agency', tagline: 'Travel beyond boundaries', location: 'Jaipur, Rajasthan', rating: 4.6, reviews: 156, packages: 15, verified: true, featured: false, specialties: ['Cultural', 'Heritage', 'Family'], since: 2016 },
  { id: '4', slug: 'mountain-trails', name: 'Mountain Trails India', tagline: 'Conquer every peak', location: 'Manali, Himachal Pradesh', rating: 4.9, reviews: 89, packages: 12, verified: true, featured: false, specialties: ['Trekking', 'Adventure', 'Camping'], since: 2019 },
  { id: '5', slug: 'coastal-vibes', name: 'Coastal Vibes Tours', tagline: 'Life is better at the beach', location: 'Goa', rating: 4.5, reviews: 203, packages: 20, verified: true, featured: true, specialties: ['Beach', 'Nightlife', 'Water Sports'], since: 2017 },
  { id: '6', slug: 'heritage-walks', name: 'Heritage Walks India', tagline: 'Stories carved in stone', location: 'Udaipur, Rajasthan', rating: 4.4, reviews: 67, packages: 8, verified: false, featured: false, specialties: ['Cultural', 'History', 'Photography'], since: 2020 },
  { id: '7', slug: 'backwater-cruises', name: 'Backwater Cruises Kerala', tagline: 'Drift into serenity', location: 'Kochi, Kerala', rating: 4.8, reviews: 145, packages: 14, verified: true, featured: false, specialties: ['Luxury', 'Nature', 'Wellness'], since: 2014 },
  { id: '8', slug: 'himalayan-heights', name: 'Himalayan Heights', tagline: 'Altitude changes everything', location: 'Leh, Ladakh', rating: 4.7, reviews: 98, packages: 10, verified: true, featured: false, specialties: ['Adventure', 'Road Trip', 'Photography'], since: 2018 },
];

const SPECIALTIES = ['All', 'Beach', 'Adventure', 'Luxury', 'Cultural', 'Trekking', 'Honeymoon', 'Family', 'Group Tours'];

type SortOption = 'rating' | 'reviews' | 'packages' | 'name';

/* ── Agency Card ─────────────────────────────────────────────────────────── */
function AgencyCard({ agency }: { agency: typeof MOCK_AGENCIES[0] }) {
  return (
    <Link
      href={`/agencies/${agency.slug}`}
      className="group flex flex-col rounded-2xl border bg-card overflow-hidden card-lift"
    >
      {/* Header banner */}
      <div className="relative h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/10 overflow-hidden">
        {agency.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[0.625rem] font-bold text-white">
            <Award className="h-3 w-3" />
            Featured
          </div>
        )}
        {agency.verified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[0.625rem] font-bold text-white">
            <Shield className="h-3 w-3" />
            Verified
          </div>
        )}
        {/* Avatar */}
        <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center rounded-xl bg-card border-2 border-background shadow-md text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          {agency.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 pt-9">
        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          {agency.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 italic">{agency.tagline}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
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
            <span className="text-[0.625rem] text-muted-foreground">{agency.reviews} reviews</span>
          </div>
          <div className="text-center border-x">
            <div className="flex items-center justify-center gap-0.5">
              <Package className="h-3 w-3 text-primary" />
              <span className="text-sm font-bold">{agency.packages}</span>
            </div>
            <span className="text-[0.625rem] text-muted-foreground">packages</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-bold">Since</span>
            <p className="text-[0.625rem] text-muted-foreground">{agency.since}</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agency.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">View profile & packages</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
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

  const filtered = MOCK_AGENCIES
    .filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (specialty !== 'All' && !a.specialties.includes(specialty)) return false;
      if (verifiedOnly && !a.verified) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      if (sortBy === 'packages') return b.packages - a.packages;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
          Travel Agencies
        </h1>
        <p className="mt-2 text-muted-foreground max-w-lg">
          Browse verified travel agencies across India. Each agency is vetted for quality and reliability.
        </p>
      </div>

      {/* Search + Filters bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="flex flex-1 max-w-sm items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 transition-colors focus-within:border-primary/50">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agencies or locations…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Toggle mobile filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Desktop filters */}
        <div className="hidden lg:flex items-center gap-3">
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
            className="rounded-lg border bg-card px-3 py-2 text-xs font-medium outline-none transition-colors focus:border-primary"
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
        <div className="lg:hidden mb-6 rounded-xl border bg-card p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors w-full justify-center',
              verifiedOnly ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-muted',
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Verified Only
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full rounded-lg border bg-card px-3 py-2 text-xs font-medium outline-none"
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
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-5 text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> agencies
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
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>No agencies found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search or filter criteria to see more results.
          </p>
          <button
            onClick={() => { setSearch(''); setSpecialty('All'); setVerifiedOnly(false); }}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
