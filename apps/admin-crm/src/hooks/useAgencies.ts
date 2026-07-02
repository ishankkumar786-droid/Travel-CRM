import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { AgencyListQuery, BulkOperationInput } from '@travel/types';

import { agencyApi } from '@/services/agency.api';

export const agencyKeys = {
  all: ['agencies'] as const,
  lists: () => [...agencyKeys.all, 'list'] as const,
  list: (params: Partial<AgencyListQuery>) => [...agencyKeys.lists(), params] as const,
  details: () => [...agencyKeys.all, 'detail'] as const,
  detail: (id: string) => [...agencyKeys.details(), id] as const,
  stats: () => [...agencyKeys.all, 'stats'] as const,
};

/** List agencies with pagination, search, filters */
export function useAgencies(params: Partial<AgencyListQuery>) {
  return useQuery({
    queryKey: agencyKeys.list(params),
    queryFn: () => agencyApi.list(params),
    placeholderData: (prev) => prev,
  });
}

/** Single agency detail */
export function useAgency(id: string) {
  return useQuery({
    queryKey: agencyKeys.detail(id),
    queryFn: () => agencyApi.getById(id),
    enabled: !!id,
  });
}

/** Agency statistics */
export function useAgencyStats() {
  return useQuery({
    queryKey: agencyKeys.stats(),
    queryFn: () => agencyApi.getStats(),
    staleTime: 60_000,
  });
}

/** Create agency */
export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => agencyApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success('Agency created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Update agency */
export function useUpdateAgency(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => agencyApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success('Agency updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Delete agency */
export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agencyApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success('Agency deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Archive agency */
export function useArchiveAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agencyApi.archive(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success('Agency archived');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Restore agency */
export function useRestoreAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agencyApi.restore(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success('Agency restored');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Bulk operations */
export function useBulkAgencyOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkOperationInput) => agencyApi.bulk(input),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: agencyKeys.all });
      toast.success(`${result.processed} agencies updated`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
