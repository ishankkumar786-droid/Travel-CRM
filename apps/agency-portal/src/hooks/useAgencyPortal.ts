'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { agencyApi, onboardingApi, marketplaceProfileApi, packageApi } from '@/services/agency.api';

/**
 * Returns the agencyId from the authenticated user.
 * All agency portal hooks depend on this value.
 */
export function useAgencyId(): string | undefined {
  const { user } = useAuth();
  return user?.agencyId ?? undefined;
}

// ─── Agency Profile ───────────────────────────────────────────────────────────

export function useAgencyProfile() {
  const agencyId = useAgencyId();
  return useQuery({
    queryKey: ['agency', 'profile', agencyId],
    queryFn: () => agencyApi.getById(agencyId!),
    enabled: !!agencyId,
  });
}

export function useUpdateAgencyProfile() {
  const agencyId = useAgencyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => agencyApi.update(agencyId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'profile', agencyId] }),
  });
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export function useOnboarding() {
  const agencyId = useAgencyId();
  return useQuery({
    queryKey: ['agency', 'onboarding', agencyId],
    queryFn: () => onboardingApi.get(agencyId!),
    enabled: !!agencyId,
  });
}

// ─── Marketplace Profile ──────────────────────────────────────────────────────

export function useMarketplaceProfile() {
  const agencyId = useAgencyId();
  return useQuery({
    queryKey: ['agency', 'marketplace-profile', agencyId],
    queryFn: () => marketplaceProfileApi.get(agencyId!),
    enabled: !!agencyId,
  });
}

export function useMarketplaceReadiness() {
  const agencyId = useAgencyId();
  return useQuery({
    queryKey: ['agency', 'marketplace-readiness', agencyId],
    queryFn: () => marketplaceProfileApi.getReadiness(agencyId!),
    enabled: !!agencyId,
  });
}

export function useUpdateMarketplaceProfile() {
  const agencyId = useAgencyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      marketplaceProfileApi.update(agencyId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', 'marketplace-profile', agencyId] });
      qc.invalidateQueries({ queryKey: ['agency', 'marketplace-readiness', agencyId] });
    },
  });
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export function usePackages(params: Record<string, unknown> = {}) {
  const agencyId = useAgencyId();
  return useQuery({
    queryKey: ['agency', 'packages', agencyId, params],
    queryFn: () => packageApi.list(agencyId!, params),
    enabled: !!agencyId,
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packageApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const agencyId = useAgencyId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => packageApi.create(agencyId!, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'packages'] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      packageApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'packages'] }),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packageApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'packages'] }),
  });
}
