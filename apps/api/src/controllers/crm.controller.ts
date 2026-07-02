import { sendCreated, sendNoContent, sendPaginated, sendSuccess } from '@/lib/response';
import { activityService } from '@/services/activity.service';
import { contactService } from '@/services/contact.service';
import { crmDashboardService } from '@/services/crm-dashboard.service';
import { followUpService } from '@/services/followup.service';
import { noteService } from '@/services/note.service';
import { searchService } from '@/services/search.service';
import { taskService } from '@/services/task.service';
import { timelineService } from '@/services/timeline.service';

import type {
  CreateActivityInput,
  CreateContactInput,
  CreateFollowUpInput,
  CreateNoteInput,
  CreateTaskInput,
  UpdateActivityInput,
  UpdateContactInput,
  UpdateFollowUpInput,
  UpdateNoteInput,
  UpdateTaskInput,
} from '@travel/validation';
import type { Request, Response } from 'express';

// Helper: strip undefined values — cast to exact type afterward
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function defined<T>(obj: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────
export class ContactController {
  async create(req: Request, res: Response): Promise<void> {
    const agency = req.params['agencyId'] as string;
    const contact = await contactService.create(
      agency,
      req.body as CreateContactInput,
      req.user?.id,
    );
    sendCreated(res, contact, 'Contact created');
  }
  async list(req: Request, res: Response): Promise<void> {
    const agency = req.params['agencyId'] as string;
    const {
      page = '1',
      limit = '20',
      search,
      status,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await contactService.listByAgency(
      agency,
      defined({ page: Number(page), limit: Number(limit), search, status }),
    );
    sendPaginated(res, items, pagination, 'Contacts retrieved');
  }
  async getById(req: Request, res: Response): Promise<void> {
    const contact = await contactService.getById(req.params['id'] as string);
    sendSuccess(res, contact, 'Contact retrieved');
  }
  async update(req: Request, res: Response): Promise<void> {
    const contact = await contactService.update(
      req.params['id'] as string,
      req.body as UpdateContactInput,
      req.user?.id,
    );
    sendSuccess(res, contact, 'Contact updated');
  }
  async delete(req: Request, res: Response): Promise<void> {
    await contactService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  }
  async setPrimary(req: Request, res: Response): Promise<void> {
    const contact = await contactService.setPrimary(req.params['id'] as string, req.user?.id);
    sendSuccess(res, contact, 'Primary contact set');
  }
}

// ─── Activities ───────────────────────────────────────────────────────────────
export class ActivityController {
  async create(req: Request, res: Response): Promise<void> {
    const agency = req.params['agencyId'] as string;
    const activity = await activityService.create(
      agency,
      req.body as CreateActivityInput,
      req.user?.id,
    );
    sendCreated(res, activity, 'Activity logged');
  }
  async list(req: Request, res: Response): Promise<void> {
    const agency = req.params['agencyId'] as string;
    const {
      page = '1',
      limit = '20',
      type,
      search,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await activityService.listByAgency(
      agency,
      defined({ page: Number(page), limit: Number(limit), type, search }),
    );
    sendPaginated(res, items, pagination, 'Activities retrieved');
  }
  async getById(req: Request, res: Response): Promise<void> {
    const activity = await activityService.getById(req.params['id'] as string);
    sendSuccess(res, activity, 'Activity retrieved');
  }
  async update(req: Request, res: Response): Promise<void> {
    const activity = await activityService.update(
      req.params['id'] as string,
      req.body as UpdateActivityInput,
      req.user?.id,
    );
    sendSuccess(res, activity, 'Activity updated');
  }
  async delete(req: Request, res: Response): Promise<void> {
    await activityService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export class NoteController {
  async create(req: Request, res: Response): Promise<void> {
    const note = await noteService.create(
      req.params['agencyId'] as string,
      req.body as CreateNoteInput,
      req.user?.id,
    );
    sendCreated(res, note, 'Note created');
  }
  async list(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      search,
      tags,
      visibility,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await noteService.listByAgency(
      req.params['agencyId'] as string,
      defined({ page: Number(page), limit: Number(limit), search, tags, visibility }),
    );
    sendPaginated(res, items, pagination, 'Notes retrieved');
  }
  async update(req: Request, res: Response): Promise<void> {
    const note = await noteService.update(
      req.params['id'] as string,
      req.body as UpdateNoteInput,
      req.user?.id,
    );
    sendSuccess(res, note, 'Note updated');
  }
  async delete(req: Request, res: Response): Promise<void> {
    await noteService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  }
  async togglePin(req: Request, res: Response): Promise<void> {
    const note = await noteService.togglePin(req.params['id'] as string);
    sendSuccess(res, note, 'Note pin toggled');
  }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export class TaskController {
  async create(req: Request, res: Response): Promise<void> {
    const task = await taskService.create(
      req.params['agencyId'] as string,
      req.body as CreateTaskInput,
      req.user?.id,
    );
    sendCreated(res, task, 'Task created');
  }
  async list(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      status,
      priority,
      assignedTo,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await taskService.listByAgency(
      req.params['agencyId'] as string,
      defined({ page: Number(page), limit: Number(limit), status, priority, assignedTo }),
    );
    sendPaginated(res, items, pagination, 'Tasks retrieved');
  }
  async update(req: Request, res: Response): Promise<void> {
    const task = await taskService.update(
      req.params['id'] as string,
      req.body as UpdateTaskInput,
      req.user?.id,
    );
    sendSuccess(res, task, 'Task updated');
  }
  async delete(req: Request, res: Response): Promise<void> {
    await taskService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  }
  async complete(req: Request, res: Response): Promise<void> {
    const task = await taskService.complete(req.params['id'] as string, req.user?.id);
    sendSuccess(res, task, 'Task completed');
  }
}

// ─── Follow-ups ───────────────────────────────────────────────────────────────
export class FollowUpController {
  async create(req: Request, res: Response): Promise<void> {
    const followup = await followUpService.create(
      req.params['agencyId'] as string,
      req.body as CreateFollowUpInput,
      req.user?.id,
    );
    sendCreated(res, followup, 'Follow-up created');
  }
  async list(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      status,
      assignedTo,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await followUpService.listByAgency(
      req.params['agencyId'] as string,
      defined({ page: Number(page), limit: Number(limit), status, assignedTo }),
    );
    sendPaginated(res, items, pagination, 'Follow-ups retrieved');
  }
  async update(req: Request, res: Response): Promise<void> {
    const followup = await followUpService.update(
      req.params['id'] as string,
      req.body as UpdateFollowUpInput,
      req.user?.id,
    );
    sendSuccess(res, followup, 'Follow-up updated');
  }
  async delete(req: Request, res: Response): Promise<void> {
    await followUpService.delete(req.params['id'] as string, req.user?.id);
    sendNoContent(res);
  }
  async complete(req: Request, res: Response): Promise<void> {
    const followup = await followUpService.complete(req.params['id'] as string, req.user?.id);
    sendSuccess(res, followup, 'Follow-up completed');
  }
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export class TimelineController {
  async getForAgency(req: Request, res: Response): Promise<void> {
    const {
      page = '1',
      limit = '20',
      types,
      search,
    } = req.query as Record<string, string | undefined>;
    const { items, pagination } = await timelineService.getForAgency(
      req.params['agencyId'] as string,
      defined({ page: Number(page), limit: Number(limit), types, search }),
    );
    sendPaginated(res, items, pagination, 'Timeline retrieved');
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────
export class SearchController {
  async globalSearch(req: Request, res: Response): Promise<void> {
    const { q, limit = '5' } = req.query as Record<string, string | undefined>;
    const results = await searchService.globalSearch(q ?? '', Number(limit));
    sendSuccess(res, results, 'Search results');
  }
}

// ─── CRM Dashboard ────────────────────────────────────────────────────────────
export class CRMDashboardController {
  async getStats(req: Request, res: Response): Promise<void> {
    const stats = await crmDashboardService.getStats(req.user?.id ?? '');
    sendSuccess(res, stats, 'CRM dashboard stats');
  }
}

export const contactController = new ContactController();
export const activityController = new ActivityController();
export const noteController = new NoteController();
export const taskController = new TaskController();
export const followUpController = new FollowUpController();
export const timelineController = new TimelineController();
export const searchController = new SearchController();
export const crmDashboardController = new CRMDashboardController();
