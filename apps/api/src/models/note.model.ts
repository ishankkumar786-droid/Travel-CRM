import mongoose, { type Document, Schema } from 'mongoose';

import type { NoteDTO, NoteVisibility } from '@travel/types';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  agencyId: mongoose.Types.ObjectId;
  content: string;
  isPinned: boolean;
  visibility: NoteVisibility;
  tags: string[];
  createdBy?: mongoose.Types.ObjectId | undefined;
  updatedBy?: mongoose.Types.ObjectId | undefined;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  toDTO(createdByName?: string): NoteDTO;
}

const noteSchema = new Schema<INote>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: 'Agency', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    isPinned: { type: Boolean, default: false },
    visibility: { type: String, enum: ['internal', 'public'], default: 'internal' },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

noteSchema.index({ agencyId: 1, createdAt: -1 });
noteSchema.index({ agencyId: 1, isPinned: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ deletedAt: 1 });
noteSchema.index({ agencyId: 1, content: 'text' });

noteSchema.pre(/^find/, function (this: mongoose.Query<unknown, INote>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

noteSchema.methods['toDTO'] = function (createdByName?: string): NoteDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    agencyId: (this.agencyId as mongoose.Types.ObjectId).toString(),
    content: this.content as string,
    isPinned: this.isPinned as boolean,
    visibility: this.visibility as NoteVisibility,
    tags: this.tags as string[],
    createdBy:
      this.createdBy !== null && this.createdBy !== undefined
        ? (this.createdBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdByName,
    updatedBy:
      this.updatedBy !== null && this.updatedBy !== undefined
        ? (this.updatedBy as mongoose.Types.ObjectId).toString()
        : undefined,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const Note = mongoose.model<INote>('Note', noteSchema);
