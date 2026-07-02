import mongoose, { type Document, Schema } from 'mongoose';

import type { AuditAction, AuditLogDTO } from '@travel/types';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  resource: string;
  resourceId: mongoose.Types.ObjectId;
  action: AuditAction;
  who: mongoose.Types.ObjectId;
  whoName?: string | undefined;
  before?: Record<string, unknown> | undefined;
  after?: Record<string, unknown> | undefined;
  ip?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): AuditLogDTO;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    resource: { type: String, required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'archive', 'restore', 'status_change'],
      required: true,
    },
    who: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    whoName: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true },
);

auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ who: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.methods['toDTO'] = function (): AuditLogDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    resource: this.resource as string,
    resourceId: (this.resourceId as mongoose.Types.ObjectId).toString(),
    action: this.action as AuditAction,
    who: (this.who as mongoose.Types.ObjectId).toString(),
    whoName: this.whoName as string | undefined,
    before: this.before as Record<string, unknown> | undefined,
    after: this.after as Record<string, unknown> | undefined,
    ip: this.ip as string | undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

/** Log a single audit event */
export async function logAudit(params: {
  resource: string;
  resourceId: string;
  action: AuditAction;
  who: string;
  whoName?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      resource: params.resource,
      resourceId: params.resourceId,
      action: params.action,
      who: params.who,
      whoName: params.whoName,
      before: params.before,
      after: params.after,
      ip: params.ip,
    });
  } catch {
    // Audit log failures must never break main operations
  }
}
