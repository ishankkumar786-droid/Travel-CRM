import type { BaseEntity, ISODateString, ObjectIdString } from './common';

// ─── Onboarding ───────────────────────────────────────────────────────────────

export type OnboardingStage =
  | 'invited'
  | 'applied'
  | 'documents_submitted'
  | 'verification_pending'
  | 'verified'
  | 'marketplace_approved'
  | 'live'
  | 'suspended'
  | 'rejected';

export interface OnboardingDTO extends BaseEntity {
  agencyId: ObjectIdString;
  stage: OnboardingStage;
  assignedReviewer?: ObjectIdString | undefined;
  checklist: OnboardingChecklist;
  history: Array<{
    stage: OnboardingStage;
    changedBy: ObjectIdString;
    changedAt: ISODateString;
    remarks?: string | undefined;
  }>;
  marketplaceEligible: boolean;
  eligibilityReasons: string[];
}

export interface OnboardingChecklist {
  profileComplete: boolean;
  documentsSubmitted: boolean;
  verificationPassed: boolean;
  packagesAdded: boolean;
  bankDetailsAdded: boolean;
}

// ─── Marketplace Profile ──────────────────────────────────────────────────────

export interface MarketplaceProfileDTO extends BaseEntity {
  agencyId: ObjectIdString;
  publicSlug: string;
  description?: string | undefined;
  logoUrl?: string | undefined;
  bannerUrl?: string | undefined;
  gallery: string[];
  socialLinks: {
    facebook?: string | undefined;
    instagram?: string | undefined;
    twitter?: string | undefined;
    linkedin?: string | undefined;
    youtube?: string | undefined;
    website?: string | undefined;
  };
  businessHours: Array<{
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }>;
  languages: string[];
  awards: string[];
  certifications: string[];
  yearsExperience?: number | undefined;
  specializations: string[];
  verificationScore: number;
  profileScore: number;
  trustScore: number;
  marketplaceScore: number;
  readinessPercent: number;
  missingInfo: string[];
  seo: {
    title?: string | undefined;
    description?: string | undefined;
    keywords: string[];
    canonicalUrl?: string | undefined;
    ogTitle?: string | undefined;
    ogDescription?: string | undefined;
    ogImage?: string | undefined;
  };
  isPublic: boolean;
}

// ─── Package ──────────────────────────────────────────────────────────────────

export type PackageStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type PackageDifficulty = 'easy' | 'moderate' | 'challenging' | 'extreme';

export interface PackageDTO extends BaseEntity {
  agencyId: ObjectIdString;
  name: string;
  slug: string;
  destinationId?: ObjectIdString | undefined;
  destinationName?: string | undefined;
  category: string;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  currency: string;
  season?: string | undefined;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  terms?: string | undefined;
  gallery: string[];
  coverImage?: string | undefined;
  itinerary?: Array<{ day: number; title: string; description: string }> | undefined;
  hotelCategory?: string | undefined;
  meals?: string | undefined;
  transport?: string | undefined;
  difficulty: PackageDifficulty;
  minAge?: number | undefined;
  maxAge?: number | undefined;
  minGroupSize?: number | undefined;
  maxGroupSize?: number | undefined;
  status: PackageStatus;
  isFeatured: boolean;
  version: number;
  seo: {
    title?: string | undefined;
    description?: string | undefined;
    keywords: string[];
  };
  createdBy?: ObjectIdString | undefined;
}

// ─── Destination ──────────────────────────────────────────────────────────────

export interface DestinationDTO extends BaseEntity {
  name: string;
  slug: string;
  type: 'country' | 'state' | 'city' | 'tourist_place';
  parentId?: ObjectIdString | undefined;
  countryCode?: string | undefined;
  description?: string | undefined;
  images: string[];
  coverImage?: string | undefined;
  category: string[];
  isPopular: boolean;
  isFeatured: boolean;
  seo: {
    title?: string | undefined;
    description?: string | undefined;
    keywords: string[];
  };
  coordinates?: { lat: number; lng: number } | undefined;
}

// ─── Service Catalog ──────────────────────────────────────────────────────────

export interface ServiceCatalogItem extends BaseEntity {
  catalogType:
    | 'package_type'
    | 'travel_style'
    | 'amenity'
    | 'activity'
    | 'transport'
    | 'accommodation'
    | 'meal_plan'
    | 'tag';
  name: string;
  slug: string;
  icon?: string | undefined;
  description?: string | undefined;
  isActive: boolean;
  sortOrder: number;
}

// ─── Booking Architecture (placeholders) ─────────────────────────────────────

export type BookingStatus =
  | 'enquiry'
  | 'quoted'
  | 'confirmed'
  | 'paid'
  | 'travelling'
  | 'completed'
  | 'cancelled'
  | 'refunded';
export type EnquiryStatus = 'new' | 'responded' | 'converted' | 'closed';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';

export interface BookingArchitecture {
  booking: {
    id: string;
    agencyId: string;
    packageId: string;
    travellers: string[];
    status: BookingStatus;
    totalAmount: number;
    currency: string;
    travelDate: ISODateString;
    returnDate: ISODateString;
  };
  enquiry: {
    id: string;
    agencyId: string;
    packageId?: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: EnquiryStatus;
  };
  quotation: {
    id: string;
    enquiryId: string;
    agencyId: string;
    amount: number;
    validUntil: ISODateString;
    breakdown: Array<{ item: string; amount: number }>;
  };
  payment: {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    gateway: 'razorpay' | 'stripe' | 'cash' | 'upi';
    transactionId?: string;
  };
}

// ─── Review Architecture ──────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface ReviewDTO extends BaseEntity {
  agencyId: ObjectIdString;
  packageId?: ObjectIdString | undefined;
  travelerName: string;
  travelerEmail: string;
  rating: number; // 1 to 5
  content?: string | undefined;
  status: ReviewStatus;
  token: string; // Unique token used to submit the review
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ReviewRequestInput {
  travelerName: string;
  travelerEmail: string;
  packageId?: string | undefined;
}

export interface SubmitReviewInput {
  rating: number;
  content: string;
}

// ─── Marketplace Search ───────────────────────────────────────────────────────

export interface MarketplaceSearchQuery {
  q?: string | undefined;
  destination?: string | undefined;
  minBudget?: number | undefined;
  maxBudget?: number | undefined;
  minDays?: number | undefined;
  maxDays?: number | undefined;
  category?: string | undefined;
  minRating?: number | undefined;
  verified?: boolean | undefined;
  featured?: boolean | undefined;
  sortBy?: 'featured' | 'trending' | 'rating' | 'price_asc' | 'price_desc' | 'newest';
  page: number;
  limit: number;
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface RecommendationResult {
  popularAgencies: Array<{
    id: string;
    name: string;
    slug: string;
    city: string;
    verificationScore: number;
  }>;
  trendingPackages: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    destination: string;
  }>;
  recentlyAdded: Array<{ id: string; name: string; slug: string; createdAt: ISODateString }>;
  featuredAgencies: Array<{ id: string; name: string; slug: string; marketplaceScore: number }>;
}

// ─── Marketplace Readiness ────────────────────────────────────────────────────

export interface MarketplaceReadiness {
  agencyId: ObjectIdString;
  overallScore: number;
  verificationScore: number;
  profileScore: number;
  trustScore: number;
  readinessPercent: number;
  isEligible: boolean;
  missingItems: string[];
  recommendations: string[];
  breakdown: Record<string, { score: number; maxScore: number; items: string[] }>;
}
