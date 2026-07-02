import type { BaseEntity, ISODateString, ObjectIdString } from './common';

/** Agency lifecycle status */
export type AgencyStatus = 'active' | 'inactive' | 'pending' | 'archived' | 'suspended';

/** Verification status */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/** Marketplace listing status */
export type MarketplaceStatus = 'unlisted' | 'listed' | 'featured' | 'suspended';

/** Employee count range */
export type EmployeeCount = '1-5' | '6-10' | '11-25' | '26-50' | '51-100' | '101-250' | '250+';

/** Address sub-document */
export interface AgencyAddress {
  street?: string | undefined;
  city: string;
  state: string;
  country: string;
  postalCode?: string | undefined;
  googleMapsUrl?: string | undefined;
}

/** Agency DTO — returned by all API responses */
export interface AgencyDTO extends BaseEntity {
  agencyCode: string;
  slug: string;
  name: string;
  legalName?: string | undefined;
  ownerName: string;
  primaryContactName?: string | undefined;
  email: string;
  secondaryEmail?: string | undefined;
  phone: string;
  secondaryPhone?: string | undefined;
  whatsapp?: string | undefined;
  website?: string | undefined;
  address: AgencyAddress;
  gstNumber?: string | undefined;
  panNumber?: string | undefined;
  yearEstablished?: number | undefined;
  employeeCount?: EmployeeCount | undefined;
  status: AgencyStatus;
  verificationStatus: VerificationStatus;
  marketplaceStatus: MarketplaceStatus;
  rating?: number | undefined;
  notes?: string | undefined;
  services: string[];
  destinations: string[];
  tags: string[];
  profileCompletion: number;
  createdBy?: ObjectIdString | undefined;
  updatedBy?: ObjectIdString | undefined;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Lightweight agency summary for lists */
export interface AgencyListItem {
  id: ObjectIdString;
  agencyCode: string;
  slug: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  status: AgencyStatus;
  verificationStatus: VerificationStatus;
  marketplaceStatus: MarketplaceStatus;
  rating?: number | undefined;
  tags: string[];
  services: string[];
  profileCompletion: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Dashboard stats */
export interface AgencyStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  archived: number;
  verified: number;
  unverified: number;
  listed: number;
  addedThisMonth: number;
  addedThisWeek: number;
}

/** Query params for listing agencies */
export interface AgencyListQuery {
  page: number;
  limit: number;
  search?: string | undefined;
  status?: AgencyStatus | undefined;
  verificationStatus?: VerificationStatus | undefined;
  marketplaceStatus?: MarketplaceStatus | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  services?: string | undefined;
  destinations?: string | undefined;
  tags?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}

/** Bulk operation input */
export interface BulkOperationInput {
  ids: ObjectIdString[];
  action: 'delete' | 'archive' | 'restore' | 'activate' | 'deactivate';
  value?: string | undefined;
}

/** Bulk operation result */
export interface BulkOperationResult {
  processed: number;
  failed: number;
  errors?: string[] | undefined;
}
