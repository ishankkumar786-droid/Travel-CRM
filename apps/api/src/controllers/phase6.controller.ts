import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '@/lib/response';
import { analyticsService } from '@/services/analytics.service';
import { auditService } from '@/services/audit.service';
import { documentService } from '@/services/document.service';
import { importService } from '@/services/import.service';
import { notificationService } from '@/services/notification.service';
import { settingsService } from '@/services/settings.service';
import { userManagementService } from '@/services/user-management.service';
import { verificationService } from '@/services/verification.service';

import type { AuditLogFilter, DocumentType } from '@travel/types';
import type {
  AnalyticsQueryInput,
  InviteUserInput,
  SystemSettingsInput,
  UpdateVerificationStageInput,
  VerifyFieldInput,
} from '@travel/validation';
import type { Request, Response } from 'express';

// ─── Verification ─────────────────────────────────────────────────────────────
export const verificationController = {
  async get(req: Request, res: Response): Promise<void> {
    const result = await verificationService.getOrCreate(
      req.params['agencyId'] as string,
      req.user?.id,
    );
    sendSuccess(res, result, 'Verification retrieved');
  },
  async updateStage(req: Request, res: Response): Promise<void> {
    const result = await verificationService.updateStage(
      req.params['agencyId'] as string,
      req.body as UpdateVerificationStageInput,
      req.user?.id ?? '',
      req.user?.email,
    );
    sendSuccess(res, result, 'Verification stage updated');
  },
  async verifyField(req: Request, res: Response): Promise<void> {
    const result = await verificationService.verifyField(
      req.params['agencyId'] as string,
      req.body as VerifyFieldInput,
      req.user?.id ?? '',
    );
    sendSuccess(res, result, 'Field verified');
  },
  async getHistory(req: Request, res: Response): Promise<void> {
    const history = await verificationService.getHistory(req.params['agencyId'] as string);
    sendSuccess(res, history, 'Verification history');
  },
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const documentController = {
  async upload(req: Request, res: Response): Promise<void> {
    documentService.ensureUploadDir();
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }
    const { type, expiryDate, remarks } = req.body as {
      type: DocumentType;
      expiryDate?: string;
      remarks?: string;
    };
    const doc = await documentService.upload(
      req.params['agencyId'] as string,
      file,
      type,
      req.user?.id,
      {
        ...(expiryDate !== undefined && { expiryDate }),
        ...(remarks !== undefined && { remarks }),
      },
    );
    sendCreated(res, doc, 'Document uploaded');
  },
  async list(req: Request, res: Response): Promise<void> {
    const docs = await documentService.listByAgency(req.params['agencyId'] as string);
    sendSuccess(res, docs, 'Documents retrieved');
  },
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { status, remarks } = req.body as { status: string; remarks?: string };
    const doc = await documentService.updateStatus(
      req.params['id'] as string,
      status as never,
      req.user?.id ?? '',
      remarks,
    );
    sendSuccess(res, doc, 'Document updated');
  },
  async delete(req: Request, res: Response): Promise<void> {
    await documentService.delete(req.params['id'] as string, req.user?.id ?? '');
    sendNoContent(res);
  },
};

// ─── Import ───────────────────────────────────────────────────────────────────
export const importController = {
  async preview(req: Request, res: Response): Promise<void> {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: 'No file' });
      return;
    }
    const { name, format, conflictStrategy } = req.body as {
      name: string;
      format: string;
      conflictStrategy: string;
    };
    const result = await importService.createJob(
      name,
      format as never,
      file.buffer,
      (conflictStrategy ?? 'skip') as never,
      req.user?.id,
    );
    sendCreated(res, result, 'Import preview ready');
  },
  process(req: Request, res: Response): void {
    const { jobId } = req.body as { jobId: string };
    void importService.processJob(jobId, req.user?.id);
    sendSuccess(res, { jobId, status: 'processing' }, 'Import started');
  },
  async list(req: Request, res: Response): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const jobs = await importService.getJobs(req.user?.id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    sendSuccess(
      res,
      jobs.map((j: { toDTO: () => unknown }) => j.toDTO()),
      'Import jobs',
    );
  },
  async getJob(req: Request, res: Response): Promise<void> {
    const job = await importService.getJob(req.params['id'] as string);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    sendSuccess(res, job ? (job as { toDTO: () => unknown }).toDTO() : null, 'Import job');
  },
};

// ─── User Management ──────────────────────────────────────────────────────────
export const userMgmtController = {
  async list(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      search,
      role,
      status,
    } = req.query as Record<string, string | undefined>;
    const result = await userManagementService.list({
      page: Number(page),
      limit: Number(limit),
      ...(search !== undefined && { search }),
      ...(role !== undefined && { role }),
      ...(status !== undefined && { status }),
    });
    sendPaginated(res, result.items, result.pagination, 'Users retrieved');
  },
  async getById(req: Request, res: Response): Promise<void> {
    const user = await userManagementService.getById(req.params['id'] as string);
    sendSuccess(res, user, 'User retrieved');
  },
  async invite(req: Request, res: Response): Promise<void> {
    const user = await userManagementService.invite(req.body as InviteUserInput, req.user?.id);
    sendCreated(res, user, 'User invited');
  },
  async updateRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body as { role: string };
    const user = await userManagementService.updateRole(
      req.params['id'] as string,
      role,
      req.user?.id ?? '',
    );
    sendSuccess(res, user, 'Role updated');
  },
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body as { status: string };
    const user = await userManagementService.updateStatus(
      req.params['id'] as string,
      status,
      req.user?.id ?? '',
    );
    sendSuccess(res, user, 'Status updated');
  },
  async delete(req: Request, res: Response): Promise<void> {
    await userManagementService.delete(req.params['id'] as string, req.user?.id ?? '');
    sendNoContent(res);
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const settingsController = {
  async get(_req: Request, res: Response): Promise<void> {
    const settings = await settingsService.get();
    sendSuccess(res, settings, 'Settings retrieved');
  },
  async update(req: Request, res: Response): Promise<void> {
    const settings = await settingsService.update(req.body as SystemSettingsInput, req.user?.id);
    sendSuccess(res, settings, 'Settings updated');
  },
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsController = {
  async getSummary(req: Request, res: Response): Promise<void> {
    const { dateFrom, dateTo } = req.query as AnalyticsQueryInput;
    const data = await analyticsService.getSummary(dateFrom, dateTo);
    sendSuccess(res, data, 'Analytics summary');
  },
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationController = {
  async list(req: Request, res: Response): Promise<void> {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const data = await notificationService.getForUser(
      req.user?.id ?? '',
      Number(page),
      Number(limit),
    );
    sendSuccess(res, data, 'Notifications');
  },
  async markRead(req: Request, res: Response): Promise<void> {
    await notificationService.markRead(req.params['id'] as string);
    sendNoContent(res);
  },
  async markAllRead(req: Request, res: Response): Promise<void> {
    await notificationService.markAllRead(req.user?.id ?? '');
    sendNoContent(res);
  },
  async unreadCount(req: Request, res: Response): Promise<void> {
    const count = await notificationService.countUnread(req.user?.id ?? '');
    sendSuccess(res, { count }, 'Unread count');
  },
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditController = {
  async list(req: Request, res: Response): Promise<void> {
    const filter: AuditLogFilter = {
      resource: req.query['resource'] as string | undefined,
      resourceId: req.query['resourceId'] as string | undefined,
      action: req.query['action'] as string | undefined,
      who: req.query['who'] as string | undefined,
      dateFrom: req.query['dateFrom'] as string | undefined,
      dateTo: req.query['dateTo'] as string | undefined,
      page: Number(req.query['page'] ?? 1),
      limit: Number(req.query['limit'] ?? 20),
    };
    const { items, pagination } = await auditService.list(filter);
    sendPaginated(res, items, pagination, 'Audit logs');
  },
};
