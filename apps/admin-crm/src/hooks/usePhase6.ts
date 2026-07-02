import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  analyticsApi,
  auditApi,
  documentApi,
  importApi,
  notificationsApi,
  settingsApi,
  usersApi,
  verificationApi,
} from '@/services/phase6.api';

// ─── Verification ─────────────────────────────────────────────────────────────
export const useVerification = (agencyId: string) =>
  useQuery({
    queryKey: ['verification', agencyId],
    queryFn: () => verificationApi.get(agencyId),
    enabled: !!agencyId,
  });

export function useUpdateVerificationStage(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { stage: string; remarks?: string }) =>
      verificationApi.updateStage(agencyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['verification', agencyId] });
      toast.success('Stage updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useVerifyField(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { field: string; status: string; remarks?: string }) =>
      verificationApi.verifyField(agencyId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['verification', agencyId] });
      toast.success('Field verified');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────
export const useDocuments = (agencyId: string) =>
  useQuery({
    queryKey: ['documents', agencyId],
    queryFn: () => documentApi.list(agencyId),
    enabled: !!agencyId,
  });

export function useUploadDocument(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => documentApi.upload(agencyId, formData),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['documents', agencyId] });
      toast.success('Document uploaded');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDocument(agencyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['documents', agencyId] });
      toast.success('Document deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Import ───────────────────────────────────────────────────────────────────
export const useImportJobs = () =>
  useQuery({ queryKey: ['import-jobs'], queryFn: () => importApi.list(), staleTime: 30_000 });

export function useImportPreview() {
  return useMutation({
    mutationFn: (formData: FormData) => importApi.preview(formData),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useStartImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => importApi.process(jobId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Import started');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const useUsers = (params = {}) =>
  useQuery({ queryKey: ['users', params], queryFn: () => usersApi.list(params) });

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => usersApi.invite(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User invited');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Status updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() });

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => settingsApi.update(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const useAnalytics = (params = {}) =>
  useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsApi.getSummary(params),
    staleTime: 60_000,
  });

// ─── Notifications ────────────────────────────────────────────────────────────
export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 60_000,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
  });

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export const useAuditLogs = (params = {}) =>
  useQuery({ queryKey: ['audit-logs', params], queryFn: () => auditApi.list(params) });
