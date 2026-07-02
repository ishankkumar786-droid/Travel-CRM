import type { BaseEntity, ISODateString, ObjectIdString } from './common';

// ─── Verification ─────────────────────────────────────────────────────────────

export type VerificationStage =
  | 'pending'
  | 'researching'
  | 'documents_requested'
  | 'documents_received'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired';

export type VerificationFieldStatus = 'unverified' | 'verified' | 'failed' | 'pending';

export interface VerificationChecklist {
  emailVerified: boolean;
  phoneVerified: boolean;
  websiteVerified: boolean;
  gstVerified: boolean;
  panVerified: boolean;
  govtRegistrationVerified: boolean;
  associationVerified: boolean;
}

export interface FieldVerification {
  status: VerificationFieldStatus;
  verifiedBy?: ObjectIdString | undefined;
  verifiedAt?: ISODateString | undefined;
  remarks?: string | undefined;
}

export interface VerificationDTO extends BaseEntity {
  agencyId: ObjectIdString;
  stage: VerificationStage;
  verificationScore: number;
  confidenceScore: number;
  assignedTo?: ObjectIdString | undefined;
  assignedToName?: string | undefined;
  remarks?: string | undefined;
  checklist: VerificationChecklist;
  fields: {
    email?: FieldVerification | undefined;
    phone?: FieldVerification | undefined;
    website?: FieldVerification | undefined;
    gst?: FieldVerification | undefined;
    pan?: FieldVerification | undefined;
    govtReg?: FieldVerification | undefined;
    association?: FieldVerification | undefined;
  };
  history: Array<{
    stage: VerificationStage;
    changedBy: ObjectIdString;
    changedByName?: string | undefined;
    changedAt: ISODateString;
    remarks?: string | undefined;
  }>;
  createdBy?: ObjectIdString | undefined;
}

// ─── Document Management ──────────────────────────────────────────────────────

export type DocumentType =
  | 'gst'
  | 'pan'
  | 'trade_license'
  | 'company_registration'
  | 'iata'
  | 'ministry_registration'
  | 'brochure'
  | 'price_list'
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface DocumentDTO extends BaseEntity {
  agencyId: ObjectIdString;
  type: DocumentType;
  name: string;
  originalName: string;
  url: string;
  publicId?: string | undefined;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  version: number;
  expiryDate?: ISODateString | undefined;
  remarks?: string | undefined;
  uploadedBy?: ObjectIdString | undefined;
  verifiedBy?: ObjectIdString | undefined;
  verifiedAt?: ISODateString | undefined;
}

// ─── Import System ────────────────────────────────────────────────────────────

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rolled_back';
export type ImportFormat = 'csv' | 'xlsx' | 'json';
export type ImportConflictStrategy = 'skip' | 'merge' | 'overwrite';

export interface ImportJobDTO extends BaseEntity {
  name: string;
  format: ImportFormat;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  skippedRows: number;
  conflictStrategy: ImportConflictStrategy;
  errors: Array<{ row: number; message: string }>;
  createdBy?: ObjectIdString | undefined;
  completedAt?: ISODateString | undefined;
}

// ─── Source of Truth ──────────────────────────────────────────────────────────

export interface FieldSource {
  value: string;
  source: 'manual' | 'collector' | 'import' | 'scraper';
  confidence: number;
  collectedAt: ISODateString;
  updatedAt: ISODateString;
  verifiedBy?: ObjectIdString | undefined;
  manualOverride: boolean;
}

// ─── User Management ──────────────────────────────────────────────────────────

export interface UserManagementDTO extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  lastLogin?: ISODateString | undefined;
  avatar?: string | undefined;
}

// ─── System Settings ──────────────────────────────────────────────────────────

export interface SystemSettings {
  general: {
    companyName: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  verification: {
    autoAssign: boolean;
    defaultAssignee?: ObjectIdString | undefined;
    requireDocuments: boolean;
    minScore: number;
  };
  import: {
    maxFileSizeMb: number;
    allowedFormats: ImportFormat[];
    defaultConflictStrategy: ImportConflictStrategy;
  };
  notifications: {
    taskDueReminderHours: number;
    followupReminderHours: number;
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  agencies: {
    total: number;
    growth: number;
    byStatus: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
  };
  verification: {
    rate: number;
    byStage: Record<string, number>;
    avgDaysToVerify: number;
  };
  activities: {
    total: number;
    byType: Record<string, number>;
    byUser: Array<{ userId: string; name: string; count: number }>;
  };
  tasks: {
    completion: number;
    overdue: number;
    byPriority: Record<string, number>;
  };
  imports: {
    total: number;
    successRate: number;
    totalRows: number;
  };
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface NotificationSummary {
  unreadCount: number;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body?: string | undefined;
    isRead: boolean;
    createdAt: ISODateString;
  }>;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLogFilter {
  resource?: string | undefined;
  resourceId?: string | undefined;
  action?: string | undefined;
  who?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page: number;
  limit: number;
}
