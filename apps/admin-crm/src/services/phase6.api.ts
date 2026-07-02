import type {
  AnalyticsSummary,
  AuditLogDTO,
  DocumentDTO,
  ImportJobDTO,
  NotificationSummary,
  PaginationMeta,
  SystemSettings,
  UserManagementDTO,
  VerificationDTO,
} from '@travel/types';

import { apiClient } from '@/lib/api-client';

type Envelope<T> = { success: boolean; data: T; message?: string };
type Paged<T> = { success: boolean; data: T[]; pagination: PaginationMeta };

// ─── Verification ─────────────────────────────────────────────────────────────
export const verificationApi = {
  get: async (agencyId: string) => {
    const { data } = await apiClient.get<Envelope<VerificationDTO>>(
      `/agencies/${agencyId}/verification`,
    );
    return data.data;
  },
  updateStage: async (agencyId: string, payload: { stage: string; remarks?: string }) => {
    const { data } = await apiClient.put<Envelope<VerificationDTO>>(
      `/agencies/${agencyId}/verification/stage`,
      payload,
    );
    return data.data;
  },
  verifyField: async (
    agencyId: string,
    payload: { field: string; status: string; remarks?: string },
  ) => {
    const { data } = await apiClient.put<Envelope<VerificationDTO>>(
      `/agencies/${agencyId}/verification/fields`,
      payload,
    );
    return data.data;
  },
  getHistory: async (agencyId: string) => {
    const { data } = await apiClient.get<Envelope<VerificationDTO['history']>>(
      `/agencies/${agencyId}/verification/history`,
    );
    return data.data;
  },
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentApi = {
  list: async (agencyId: string) => {
    const { data } = await apiClient.get<Envelope<DocumentDTO[]>>(
      `/agencies/${agencyId}/documents`,
    );
    return data.data;
  },
  upload: async (agencyId: string, formData: FormData) => {
    const { data } = await apiClient.post<Envelope<DocumentDTO>>(
      `/agencies/${agencyId}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return data.data;
  },
  updateStatus: async (id: string, status: string, remarks?: string) => {
    const { data } = await apiClient.put<Envelope<DocumentDTO>>(`/documents/${id}/status`, {
      status,
      remarks,
    });
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/documents/${id}`);
  },
};

// ─── Import ───────────────────────────────────────────────────────────────────
export const importApi = {
  preview: async (formData: FormData) => {
    const { data } = await apiClient.post<
      Envelope<{ jobId: string; preview: unknown[]; totalRows: number }>
    >('/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
  process: async (jobId: string) => {
    const { data } = await apiClient.post<Envelope<{ jobId: string; status: string }>>(
      '/import/process',
      { jobId },
    );
    return data.data;
  },
  list: async () => {
    const { data } = await apiClient.get<Envelope<ImportJobDTO[]>>('/import/jobs');
    return data.data;
  },
  getJob: async (id: string) => {
    const { data } = await apiClient.get<Envelope<ImportJobDTO>>(`/import/jobs/${id}`);
    return data.data;
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: async (params = {}) => {
    const { data } = await apiClient.get<Paged<UserManagementDTO>>('/users', { params });
    return { items: data.data, pagination: data.pagination };
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<Envelope<UserManagementDTO>>(`/users/${id}`);
    return data.data;
  },
  invite: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<UserManagementDTO>>('/users/invite', payload);
    return data.data;
  },
  updateRole: async (id: string, role: string) => {
    const { data } = await apiClient.put<Envelope<UserManagementDTO>>(`/users/${id}/role`, {
      role,
    });
    return data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.put<Envelope<UserManagementDTO>>(`/users/${id}/status`, {
      status,
    });
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: async () => {
    const { data } = await apiClient.get<Envelope<SystemSettings>>('/settings');
    return data.data;
  },
  update: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<SystemSettings>>('/settings', payload);
    return data.data;
  },
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getSummary: async (params = {}) => {
    const { data } = await apiClient.get<Envelope<AnalyticsSummary>>('/analytics', { params });
    return data.data;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: async (params = {}) => {
    const { data } = await apiClient.get<Envelope<NotificationSummary>>('/notifications', {
      params,
    });
    return data.data;
  },
  markRead: async (id: string) => {
    await apiClient.put(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    await apiClient.put('/notifications/read-all');
  },
  unreadCount: async () => {
    const { data } = await apiClient.get<Envelope<{ count: number }>>(
      '/notifications/unread-count',
    );
    return data.data.count;
  },
};

// ─── Audit ────────────────────────────────────────────────────────────────────
export const auditApi = {
  list: async (params = {}) => {
    const { data } = await apiClient.get<Paged<AuditLogDTO>>('/audit-logs', { params });
    return { items: data.data, pagination: data.pagination };
  },
};
