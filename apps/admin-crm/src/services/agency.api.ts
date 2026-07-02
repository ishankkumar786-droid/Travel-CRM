import type {
  AgencyDTO,
  AgencyListItem,
  AgencyListQuery,
  AgencyStats,
  BulkOperationInput,
  BulkOperationResult,
  PaginationMeta,
} from '@travel/types';

import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedEnvelope<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export const agencyApi = {
  async list(
    params: Partial<AgencyListQuery>,
  ): Promise<{ items: AgencyListItem[]; pagination: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedEnvelope<AgencyListItem>>('/agencies', {
      params,
    });
    return { items: data.data, pagination: data.pagination };
  },

  async getById(id: string): Promise<AgencyDTO> {
    const { data } = await apiClient.get<Envelope<AgencyDTO>>(`/agencies/${id}`);
    return data.data;
  },

  async create(input: Record<string, unknown>): Promise<AgencyDTO> {
    const { data } = await apiClient.post<Envelope<AgencyDTO>>('/agencies', input);
    return data.data;
  },

  async update(id: string, input: Record<string, unknown>): Promise<AgencyDTO> {
    const { data } = await apiClient.put<Envelope<AgencyDTO>>(`/agencies/${id}`, input);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/agencies/${id}`);
  },

  async archive(id: string): Promise<AgencyDTO> {
    const { data } = await apiClient.patch<Envelope<AgencyDTO>>(`/agencies/${id}/archive`);
    return data.data;
  },

  async restore(id: string): Promise<AgencyDTO> {
    const { data } = await apiClient.patch<Envelope<AgencyDTO>>(`/agencies/${id}/restore`);
    return data.data;
  },

  async bulk(input: BulkOperationInput): Promise<BulkOperationResult> {
    const { data } = await apiClient.post<Envelope<BulkOperationResult>>('/agencies/bulk', input);
    return data.data;
  },

  async getStats(): Promise<AgencyStats> {
    const { data } = await apiClient.get<Envelope<AgencyStats>>('/agencies/stats');
    return data.data;
  },

  async exportCsv(params?: Partial<AgencyListQuery>): Promise<void> {
    const res = await apiClient.get('/agencies/export/csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agencies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
