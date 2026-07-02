import type { BaseEntity, ISODateString, ObjectIdString } from './common';

// ─── Contact ──────────────────────────────────────────────────────────────────

export type ContactStatus = 'active' | 'inactive';
export type PreferredCommunication = 'email' | 'phone' | 'whatsapp' | 'in_person';

export interface ContactDTO extends BaseEntity {
  agencyId: ObjectIdString;
  firstName: string;
  lastName: string;
  fullName: string;
  designation?: string | undefined;
  department?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  whatsapp?: string | undefined;
  linkedin?: string | undefined;
  preferredCommunication: PreferredCommunication;
  isPrimary: boolean;
  notes?: string | undefined;
  status: ContactStatus;
  createdBy?: ObjectIdString | undefined;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType =
  'call' | 'meeting' | 'email' | 'whatsapp' | 'visit' | 'demo' | 'video_call' | 'other';

export interface ActivityDTO extends BaseEntity {
  agencyId: ObjectIdString;
  contactId?: ObjectIdString | undefined;
  type: ActivityType;
  title: string;
  description?: string | undefined;
  outcome?: string | undefined;
  durationMinutes?: number | undefined;
  nextAction?: string | undefined;
  nextActionDate?: ISODateString | undefined;
  createdBy?: ObjectIdString | undefined;
  createdByName?: string | undefined;
}

// ─── Note ─────────────────────────────────────────────────────────────────────

export type NoteVisibility = 'internal' | 'public';

export interface NoteDTO extends BaseEntity {
  agencyId: ObjectIdString;
  content: string;
  isPinned: boolean;
  visibility: NoteVisibility;
  tags: string[];
  createdBy?: ObjectIdString | undefined;
  createdByName?: string | undefined;
  updatedBy?: ObjectIdString | undefined;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskDTO extends BaseEntity {
  agencyId: ObjectIdString;
  assignedTo?: ObjectIdString | undefined;
  assignedToName?: string | undefined;
  title: string;
  description?: string | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: ISODateString | undefined;
  completedAt?: ISODateString | undefined;
  checklist: TaskChecklistItem[];
  labels: string[];
  createdBy?: ObjectIdString | undefined;
}

// ─── Follow-up ────────────────────────────────────────────────────────────────

export type FollowUpType = 'call' | 'email' | 'meeting' | 'whatsapp' | 'visit' | 'other';
export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';

export interface FollowUpDTO extends BaseEntity {
  agencyId: ObjectIdString;
  contactId?: ObjectIdString | undefined;
  assignedTo?: ObjectIdString | undefined;
  assignedToName?: string | undefined;
  type: FollowUpType;
  notes?: string | undefined;
  scheduledAt: ISODateString;
  reminderAt?: ISODateString | undefined;
  status: FollowUpStatus;
  completedAt?: ISODateString | undefined;
  createdBy?: ObjectIdString | undefined;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineItemType =
  | 'activity'
  | 'note'
  | 'task'
  | 'followup'
  | 'agency_created'
  | 'agency_updated'
  | 'status_changed';

export interface TimelineItem {
  id: ObjectIdString;
  type: TimelineItemType;
  title: string;
  description?: string | undefined;
  createdAt: ISODateString;
  createdBy?: ObjectIdString | undefined;
  createdByName?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditAction = 'create' | 'update' | 'delete' | 'archive' | 'restore' | 'status_change';

export interface AuditLogDTO extends BaseEntity {
  resource: string;
  resourceId: ObjectIdString;
  action: AuditAction;
  who: ObjectIdString;
  whoName?: string | undefined;
  before?: Record<string, unknown> | undefined;
  after?: Record<string, unknown> | undefined;
  ip?: string | undefined;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  'task_assigned' | 'followup_due' | 'task_due' | 'agency_updated' | 'mention' | 'system';

export interface NotificationDTO extends BaseEntity {
  userId: ObjectIdString;
  type: NotificationType;
  title: string;
  body?: string | undefined;
  resourceType?: string | undefined;
  resourceId?: ObjectIdString | undefined;
  isRead: boolean;
  readAt?: ISODateString | undefined;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface GlobalSearchResult {
  agencies: Array<{ id: string; name: string; agencyCode: string; city: string }>;
  contacts: Array<{
    id: string;
    fullName: string;
    email?: string;
    agencyId: string;
    agencyName: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    type: string;
    agencyId: string;
    agencyName: string;
  }>;
  notes: Array<{ id: string; content: string; agencyId: string; agencyName: string }>;
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    agencyId: string;
    agencyName: string;
  }>;
}

// ─── Dashboard CRM Stats ──────────────────────────────────────────────────────

export interface CRMDashboardStats {
  agencies: {
    total: number;
    active: number;
    pending: number;
    addedThisWeek: number;
    addedThisMonth: number;
  };
  tasks: {
    overdue: number;
    dueToday: number;
    assignedToMe: number;
    totalPending: number;
  };
  followups: {
    dueToday: number;
    overdue: number;
    upcomingThisWeek: number;
  };
  activities: {
    recentCount: number;
    todayCount: number;
  };
}
