import mongoose, { type Document, Schema } from 'mongoose';

import type { TaskChecklistItem, TaskDTO, TaskPriority, TaskStatus } from '@travel/types';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | undefined;
  title: string;
  description?: string | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | undefined;
  completedAt?: Date | undefined;
  checklist: TaskChecklistItem[];
  labels: string[];
  createdBy?: mongoose.Types.ObjectId | undefined;
  updatedBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(assignedToName?: string): TaskDTO;
}

const checklistSchema = new Schema<TaskChecklistItem>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const taskSchema = new Schema<ITask>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    checklist: { type: [checklistSchema], default: [] },
    labels: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

taskSchema.index({ agencyId: 1, status: 1 });
taskSchema.index({ agencyId: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ deletedAt: 1 });

taskSchema.pre(/^find/, function (this: mongoose.Query<unknown, ITask>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

taskSchema.methods['toDTO'] = function (assignedToName?: string): TaskDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    assignedTo:
      this.assignedTo !== null && this.assignedTo !== undefined
        ? (this.assignedTo as mongoose.Types.ObjectId).toString()
        : undefined,
    assignedToName,
    title: this.title as string,
    description: this.description as string | undefined,
    priority: this.priority as TaskPriority,
    status: this.status as TaskStatus,
    dueDate: this.dueDate ? (this.dueDate as Date).toISOString() : undefined,
    completedAt: this.completedAt ? (this.completedAt as Date).toISOString() : undefined,
    checklist: this.checklist as TaskChecklistItem[],
    labels: this.labels as string[],
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Task = mongoose.model<ITask>('Task', taskSchema);
