import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  destinationApi,
  marketplaceProfileApi,
  onboardingApi,
  packageApi,
} from '@/services/marketplace.api';

export const marketplaceKeys = {
  onboarding: (agencyId: string) => ['onboarding', agencyId] as const,
  onboardingList: ['onboarding', 'list'] as const,
  profile: (agencyId: string) => ['marketplace-profile', agencyId] as const,
  readiness: (agencyId: string) => ['marketplace-readiness', agencyId] as const,
  packages: (agencyId: string) => ['packages', agencyId] as const,
  destinations: ['destinations'] as const,
};

export const useOnboarding = (agencyId: string) =>
  useQuery({
    queryKey: marketplaceKeys.onboarding(agencyId),
    queryFn: () => onboardingApi.get(agencyId),
    enabled: !!agencyId,
  });

export function useUpdateOnboardingStage(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { stage: string; remarks?: string }) =>
      onboardingApi.updateStage(agencyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceKeys.onboarding(agencyId) });
      toast.success('Stage updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useMarketplaceProfile = (agencyId: string) =>
  useQuery({
    queryKey: marketplaceKeys.profile(agencyId),
    queryFn: () => marketplaceProfileApi.get(agencyId),
    enabled: !!agencyId,
  });

export function useUpdateMarketplaceProfile(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      marketplaceProfileApi.update(agencyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceKeys.profile(agencyId) });
      toast.success('Profile updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useMarketplaceReadiness = (agencyId: string) =>
  useQuery({
    queryKey: marketplaceKeys.readiness(agencyId),
    queryFn: () => marketplaceProfileApi.getReadiness(agencyId),
    enabled: !!agencyId,
  });

export const usePackages = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...marketplaceKeys.packages(agencyId), params],
    queryFn: () => packageApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreatePackage(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => packageApi.create(agencyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceKeys.packages(agencyId) });
      toast.success('Package created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePackage(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packageApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: marketplaceKeys.packages(agencyId) });
      toast.success('Package deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export const useDestinations = (params = {}) =>
  useQuery({
    queryKey: [...marketplaceKeys.destinations, params],
    queryFn: () => destinationApi.list(params),
  });
