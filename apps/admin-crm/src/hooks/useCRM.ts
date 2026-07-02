import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  activityApi,
  contactApi,
  crmDashboardApi,
  followUpApi,
  noteApi,
  searchApi,
  taskApi,
  timelineApi,
} from '@/services/crm.api';

// ─── Query key factories ──────────────────────────────────────────────────────
export const crmKeys = {
  contacts: (agencyId: string) => ['contacts', agencyId] as const,
  activities: (agencyId: string) => ['activities', agencyId] as const,
  notes: (agencyId: string) => ['notes', agencyId] as const,
  tasks: (agencyId: string) => ['tasks', agencyId] as const,
  followups: (agencyId: string) => ['followups', agencyId] as const,
  timeline: (agencyId: string) => ['timeline', agencyId] as const,
  crmStats: ['crm-stats'] as const,
};

// ─── Contacts ─────────────────────────────────────────────────────────────────
export const useContacts = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.contacts(agencyId), params],
    queryFn: () => contactApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreateContact(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => contactApi.create(agencyId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.contacts(agencyId) });
      toast.success('Contact added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateContact(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      contactApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.contacts(agencyId) });
      toast.success('Contact updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteContact(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.contacts(agencyId) });
      toast.success('Contact deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Activities ───────────────────────────────────────────────────────────────
export const useActivities = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.activities(agencyId), params],
    queryFn: () => activityApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreateActivity(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => activityApi.create(agencyId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.activities(agencyId) });
      void qc.invalidateQueries({ queryKey: crmKeys.timeline(agencyId) });
      toast.success('Activity logged');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteActivity(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activityApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.activities(agencyId) });
      toast.success('Activity deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export const useNotes = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.notes(agencyId), params],
    queryFn: () => noteApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreateNote(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => noteApi.create(agencyId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.notes(agencyId) });
      void qc.invalidateQueries({ queryKey: crmKeys.timeline(agencyId) });
      toast.success('Note saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useToggleNotePin(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noteApi.togglePin(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.notes(agencyId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteNote(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noteApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.notes(agencyId) });
      toast.success('Note deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const useTasks = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.tasks(agencyId), params],
    queryFn: () => taskApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreateTask(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => taskApi.create(agencyId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.tasks(agencyId) });
      toast.success('Task created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompleteTask(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.complete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.tasks(agencyId) });
      toast.success('Task completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.tasks(agencyId) });
      toast.success('Task deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────
export const useFollowUps = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.followups(agencyId), params],
    queryFn: () => followUpApi.list(agencyId, params),
    enabled: !!agencyId,
  });

export function useCreateFollowUp(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => followUpApi.create(agencyId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.followups(agencyId) });
      toast.success('Follow-up scheduled');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCompleteFollowUp(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => followUpApi.complete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: crmKeys.followups(agencyId) });
      toast.success('Follow-up completed');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export const useTimeline = (agencyId: string, params = {}) =>
  useQuery({
    queryKey: [...crmKeys.timeline(agencyId), params],
    queryFn: () => timelineApi.get(agencyId, params),
    enabled: !!agencyId,
  });

// ─── Search ───────────────────────────────────────────────────────────────────
export const useGlobalSearch = (q: string) =>
  useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.global(q),
    enabled: q.length >= 2,
    staleTime: 30_000,
  });

// ─── CRM Dashboard Stats ──────────────────────────────────────────────────────
export const useCRMStats = () =>
  useQuery({
    queryKey: crmKeys.crmStats,
    queryFn: () => crmDashboardApi.getStats(),
    staleTime: 60_000,
  });
