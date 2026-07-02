import { Note, type INote } from '@/models/note.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { FilterQuery } from 'mongoose';

export class NoteRepository {
  async findById(id: string): Promise<INote | null> {
    return Note.findById(id).exec();
  }

  async findByAgency(
    agencyId: string,
    opts: { page: number; limit: number; search?: string; tags?: string; visibility?: string },
  ) {
    const filter: FilterQuery<INote> = { agencyId };
    if (opts.visibility) filter['visibility'] = opts.visibility;
    if (opts.tags) filter['tags'] = { $in: opts.tags.split(',').map((t) => t.trim()) };
    if (opts.search) {
      filter['$text'] = { $search: opts.search };
    }
    const [pinned, regular, total] = await Promise.all([
      Note.find({ ...filter, isPinned: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .exec(),
      Note.find({ ...filter, isPinned: false })
        .sort({ createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Note.countDocuments(filter).exec(),
    ]);
    const items = [...pinned, ...regular];
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async create(data: Partial<INote>): Promise<INote> {
    const note = new Note(data);
    return note.save();
  }

  async update(id: string, data: Partial<INote>): Promise<INote | null> {
    return Note.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await Note.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
    return result !== null;
  }

  async togglePin(id: string): Promise<INote | null> {
    const note = await Note.findById(id).exec();
    if (!note) return null;
    note.isPinned = !note.isPinned;
    return note.save();
  }
}

export const noteRepository = new NoteRepository();
