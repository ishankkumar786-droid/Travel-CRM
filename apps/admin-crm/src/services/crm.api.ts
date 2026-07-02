import type {
  ActivityDTO,
  CRMDashboardStats,
  ContactDTO,
  FollowUpDTO,
  GlobalSearchResult,
  NoteDTO,
  PaginationMeta,
  TaskDTO,
  TimelineItem,
} from '@travel/types';

import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
interface PagedEnvelope<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const contactApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<ContactDTO>>(
      `/agencies/${agencyId}/contacts`,
      { params },
    );
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<ContactDTO>>(
      `/agencies/${agencyId}/contacts`,
      input,
    );
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<Envelope<ContactDTO>>(`/contacts/${id}`);
    return data.data;
  },
  update: async (id: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<ContactDTO>>(`/contacts/${id}`, input);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/contacts/${id}`);
  },
  setPrimary: async (id: string) => {
    const { data } = await apiClient.patch<Envelope<ContactDTO>>(`/contacts/${id}/primary`);
    return data.data;
  },
};

// ─── Activities ───────────────────────────────────────────────────────────────
export const activityApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<ActivityDTO>>(
      `/agencies/${agencyId}/activities`,
      { params },
    );
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<ActivityDTO>>(
      `/agencies/${agencyId}/activities`,
      input,
    );
    return data.data;
  },
  update: async (id: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<ActivityDTO>>(`/activities/${id}`, input);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/activities/${id}`);
  },
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const noteApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<NoteDTO>>(`/agencies/${agencyId}/notes`, {
      params,
    });
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<NoteDTO>>(`/agencies/${agencyId}/notes`, input);
    return data.data;
  },
  update: async (id: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<NoteDTO>>(`/notes/${id}`, input);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/notes/${id}`);
  },
  togglePin: async (id: string) => {
    const { data } = await apiClient.patch<Envelope<NoteDTO>>(`/notes/${id}/pin`);
    return data.data;
  },
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<TaskDTO>>(`/agencies/${agencyId}/tasks`, {
      params,
    });
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<TaskDTO>>(`/agencies/${agencyId}/tasks`, input);
    return data.data;
  },
  update: async (id: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<TaskDTO>>(`/tasks/${id}`, input);
    return data.data;
  },
  complete: async (id: string) => {
    const { data } = await apiClient.patch<Envelope<TaskDTO>>(`/tasks/${id}/complete`);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/tasks/${id}`);
  },
};

// ─── Follow-ups ───────────────────────────────────────────────────────────────
export const followUpApi = {
  list: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<FollowUpDTO>>(
      `/agencies/${agencyId}/followups`,
      { params },
    );
    return { items: data.data, pagination: data.pagination };
  },
  create: async (agencyId: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.post<Envelope<FollowUpDTO>>(
      `/agencies/${agencyId}/followups`,
      input,
    );
    return data.data;
  },
  update: async (id: string, input: Record<string, unknown>) => {
    const { data } = await apiClient.put<Envelope<FollowUpDTO>>(`/followups/${id}`, input);
    return data.data;
  },
  complete: async (id: string) => {
    const { data } = await apiClient.patch<Envelope<FollowUpDTO>>(`/followups/${id}/complete`);
    return data.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/followups/${id}`);
  },
};

// ─── Timeline ─────────────────────────────────────────────────────────────────
export const timelineApi = {
  get: async (agencyId: string, params = {}) => {
    const { data } = await apiClient.get<PagedEnvelope<TimelineItem>>(
      `/agencies/${agencyId}/timeline`,
      { params },
    );
    return { items: data.data, pagination: data.pagination };
  },
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  global: async (q: string, limit = 5) => {
    const { data } = await apiClient.get<Envelope<GlobalSearchResult>>('/search', {
      params: { q, limit },
    });
    return data.data;
  },
};

// ─── CRM Dashboard ────────────────────────────────────────────────────────────
export const crmDashboardApi = {
  getStats: async () => {
    const { data } = await apiClient.get<Envelope<CRMDashboardStats>>('/dashboard/crm-stats');
    return data.data;
  },
};
