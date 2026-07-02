import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, HealthCheckResponse } from '@travel/types';

import { apiClient } from '@/lib/api-client';

/**
 * React Query hook for the API health check endpoint.
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<HealthCheckResponse>>('/health');
      return data.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
