import { NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { noteRepository } from '@/repositories/note.repository';

import type { NoteDTO, PaginationMeta } from '@travel/types';
import type { CreateNoteInput, UpdateNoteInput } from '@travel/validation';

class NoteService {
  async create(agencyId: string, input: CreateNoteInput, userId?: string): Promise<NoteDTO> {
    const note = await noteRepository.create({
      ...input,
      agencyId: agencyId as never,
      ...(userId && { createdBy: userId as never }),
    } as never);

    if (userId) {
      await logAudit({
        resource: 'Note',
        resourceId: note._id.toString(),
        action: 'create',
        who: userId,
      });
    }

    logger.info('note: created', { noteId: note._id.toString(), agencyId });
    return note.toDTO();
  }

  async listByAgency(
    agencyId: string,
    opts: { page: number; limit: number; search?: string; tags?: string; visibility?: string },
  ): Promise<{ items: NoteDTO[]; pagination: PaginationMeta }> {
    const { items, pagination } = await noteRepository.findByAgency(agencyId, opts);
    return { items: items.map((n) => n.toDTO()), pagination };
  }

  async getById(id: string): Promise<NoteDTO> {
    const note = await noteRepository.findById(id);
    if (!note) throw new NotFoundError('Note');
    return note.toDTO();
  }

  async update(id: string, input: UpdateNoteInput, userId?: string): Promise<NoteDTO> {
    const updated = await noteRepository.update(id, {
      ...input,
      ...(userId && { updatedBy: userId as never }),
    } as never);
    if (!updated) throw new NotFoundError('Note');

    if (userId) {
      await logAudit({
        resource: 'Note',
        resourceId: id,
        action: 'update',
        who: userId,
        after: input as Record<string, unknown>,
      });
    }
    return updated.toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const deleted = await noteRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Note');
    if (userId) {
      await logAudit({ resource: 'Note', resourceId: id, action: 'delete', who: userId });
    }
  }

  async togglePin(id: string): Promise<NoteDTO> {
    const note = await noteRepository.togglePin(id);
    if (!note) throw new NotFoundError('Note');
    return note.toDTO();
  }
}

export const noteService = new NoteService();
