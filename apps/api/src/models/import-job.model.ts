import mongoose, { Schema } from 'mongoose';

import type { ImportFormat, ImportJobDTO, ImportStatus } from '@travel/types';

// Use a plain object (not extending Document) to avoid the Mongoose `errors` field conflict
export interface IImportJob {
  _id: mongoose.Types.ObjectId;
  name: string;
  format: ImportFormat;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  skippedRows: number;
  conflictStrategy: string;
  importErrors: Array<{ row: number; message: string }>;
  rawData?: unknown;
  createdBy?: mongoose.Types.ObjectId | undefined;
  completedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(): ImportJobDTO;
}

const importJobSchema = new Schema<IImportJob>(
  {
    name: { type: String, required: true, trim: true },
    format: { type: String, enum: ['csv', 'xlsx', 'json'], required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rolled_back'],
      default: 'pending',
    },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    errorRows: { type: Number, default: 0 },
    skippedRows: { type: Number, default: 0 },
    conflictStrategy: { type: String, default: 'skip' },
    importErrors: [{ row: Number, message: String }],
    rawData: { type: Schema.Types.Mixed, select: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

importJobSchema.index({ status: 1, createdAt: -1 });
importJobSchema.index({ createdBy: 1 });

importJobSchema.methods['toDTO'] = function (): ImportJobDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    name: this.name as string,
    format: this.format as ImportFormat,
    status: this.status as ImportStatus,
    totalRows: this.totalRows as number,
    processedRows: this.processedRows as number,
    successRows: this.successRows as number,
    errorRows: this.errorRows as number,
    skippedRows: this.skippedRows as number,
    conflictStrategy: this.conflictStrategy as 'skip' | 'merge' | 'overwrite',
    errors: (this.importErrors as Array<{ row: number; message: string }>) ?? [],
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    completedAt: this.completedAt ? (this.completedAt as Date).toISOString() : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ImportJob = mongoose.model<any>('ImportJob', importJobSchema);
