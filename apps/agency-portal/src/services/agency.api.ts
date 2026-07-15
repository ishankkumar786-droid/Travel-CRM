import type {
  MarketplaceProfileDTO,
  MarketplaceReadiness,
  OnboardingDTO,
  PackageDTO,
  PaginationMeta,
  ServiceCatalogItem,
  DestinationDTO,
  AgencyDTO,
} from '@travel/types';

import { apiClient } from '@/lib/api-client';

type Env<T> = { success: boolean; data: T };
type Paged<T> = { success: boolean; data: T[]; pagination: PaginationMeta };

// ─── Agency Profile (own agency) ──────────────────────────────────────────────
export const agencyApi = {
  /** Get own agency profile (assumes agency user has an associated agencyId) */
  getById: async (agencyId: string) => {
    const { data } = await apiClient.get<Env<AgencyDTO>>(`/agencies/${agencyId}`);
    return data.data;
  },
  update: async (agencyId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<Env<AgencyDTO>>(`/agencies/${agencyId}`, payload);
    return data.data;
  },
};

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingApi = {
  get: async (agencyId: string) => {
    const { data } = await apiClient.get<Env<OnboardingDTO>>(
      `/agencies/${agencyId}/onboarding`,
    );
    return data.data;
  },
};

// ─── Marketplace Profile ──────────────────────────────────────────────────────
export const marketplaceProfileApi = {
  get: async (agencyId: string) => {
    const { data } = await apiClient.get<Env<MarketplaceProfileDTO>>(
      `/agencies/${agencyId}/marketplace-profile`,
    );
    return data.data;
  },
  update: async (agencyId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<Env<MarketplaceProfileDTO>>(
      `/agencies/${agencyId}/marketplace-profile`,
      payload,
    );
    return data.data;
  },
  getReadiness: async (agencyId: string) => {
    const { data } = await apiClient.get<Env<MarketplaceReadiness>>(
      `/agencies/${agencyId}/marketplace-readiness`,
    );
    return data.data;
  },
};

// ─── Packages ─────────────────────────────────────────────────────────────────
export const packageApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<Paged<PackageDTO>>(`/agencies/${agencyId}/packages`, {
      params,
    });
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<Env<PackageDTO>>(
      `/agencies/${agencyId}/packages`,
      payload,
    );
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<Env<PackageDTO>>(`/packages/${id}`);
    return data.data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<Env<PackageDTO>>(`/packages/${id}`, payload);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/packages/${id}`);
  },
};

// ─── Destinations ─────────────────────────────────────────────────────────────
export const destinationApi = {
  list: async (params = {}) => {
    const { data } = await apiClient.get<Env<DestinationDTO[]>>('/destinations', { params });
    return data.data;
  },
};

// ─── Catalog ──────────────────────────────────────────────────────────────────
export const catalogApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Env<Record<string, ServiceCatalogItem[]>>>('/catalog');
    return data.data;
  },
};
