import type {
  DestinationDTO,
  MarketplaceProfileDTO,
  MarketplaceReadiness,
  OnboardingDTO,
  PackageDTO,
  PaginationMeta,
  RecommendationResult,
  ServiceCatalogItem,
} from '@travel/types';

import { apiClient } from '@/lib/api-client';

type Env<T> = { success: boolean; data: T };
type Paged<T> = { success: boolean; data: T[]; pagination: PaginationMeta };

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const onboardingApi = {
  get: async (agencyId: string) => {
    const { data } = await apiClient.get<Env<OnboardingDTO>>(`/agencies/${agencyId}/onboarding`);
    return data.data;
  },
  updateStage: async (agencyId: string, payload: { stage: string; remarks?: string }) => {
    const { data } = await apiClient.put<Env<OnboardingDTO>>(
      `/agencies/${agencyId}/onboarding/stage`,
      payload,
    );
    return data.data;
  },
  list: async (params = {}) => {
    const { data } = await apiClient.get<Env<{ items: OnboardingDTO[]; total: number }>>(
      '/onboarding',
      { params },
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
export const catalogApiAdmin = {
  getAll: async () => {
    const { data } = await apiClient.get<Env<Record<string, ServiceCatalogItem[]>>>('/catalog');
    return data.data;
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────
export const publicMarketplaceApi = {
  recommendations: async () => {
    const { data } = await apiClient.get<Env<RecommendationResult>>('/public/recommendations');
    return data.data;
  },
};
