import { ConflictError, NotFoundError } from '@/errors';
import { logger } from '@/lib/logger';
import { logAudit } from '@/models/audit-log.model';
import { contactRepository } from '@/repositories/contact.repository';

import type { ContactDTO, PaginationMeta } from '@travel/types';
import type { CreateContactInput, UpdateContactInput } from '@travel/validation';

class ContactService {
  async create(agencyId: string, input: CreateContactInput, userId?: string): Promise<ContactDTO> {
    if (input.email && (await contactRepository.emailExistsForAgency(agencyId, input.email))) {
      throw new ConflictError('A contact with this email already exists for this agency');
    }

    const contact = await contactRepository.create({
      ...input,
      agencyId: agencyId as never,
      ...(userId && { createdBy: userId as never }),
    } as never);

    if (input.isPrimary) {
      await contactRepository.setPrimary(agencyId, contact._id.toString());
    }

    if (userId) {
      await logAudit({
        resource: 'Contact',
        resourceId: contact._id.toString(),
        action: 'create',
        who: userId,
        after: { agencyId, ...input },
      });
    }

    logger.info('contact: created', { contactId: contact._id.toString(), agencyId });
    return contact.toDTO();
  }

  async listByAgency(
    agencyId: string,
    opts: { page: number; limit: number; search?: string; status?: string },
  ): Promise<{ items: ContactDTO[]; pagination: PaginationMeta }> {
    const { items, pagination } = await contactRepository.findByAgency(agencyId, opts);
    return { items: items.map((c) => c.toDTO()), pagination };
  }

  async getById(id: string): Promise<ContactDTO> {
    const contact = await contactRepository.findById(id);
    if (!contact) throw new NotFoundError('Contact');
    return contact.toDTO();
  }

  async update(id: string, input: UpdateContactInput, userId?: string): Promise<ContactDTO> {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new NotFoundError('Contact');

    if (input.email && input.email !== existing.email) {
      if (
        await contactRepository.emailExistsForAgency(existing.agencyId.toString(), input.email, id)
      ) {
        throw new ConflictError('A contact with this email already exists for this agency');
      }
    }

    const updated = await contactRepository.update(id, {
      ...input,
      ...(userId && { updatedBy: userId as never }),
    } as never);

    if (!updated) throw new NotFoundError('Contact');

    if (input.isPrimary) {
      await contactRepository.setPrimary(existing.agencyId.toString(), id);
    }

    if (userId) {
      await logAudit({
        resource: 'Contact',
        resourceId: id,
        action: 'update',
        who: userId,
        after: input as Record<string, unknown>,
      });
    }

    return updated.toDTO();
  }

  async delete(id: string, userId?: string): Promise<void> {
    const deleted = await contactRepository.softDelete(id);
    if (!deleted) throw new NotFoundError('Contact');
    if (userId) {
      await logAudit({ resource: 'Contact', resourceId: id, action: 'delete', who: userId });
    }
  }

  async setPrimary(id: string, userId?: string): Promise<ContactDTO> {
    const contact = await contactRepository.findById(id);
    if (!contact) throw new NotFoundError('Contact');
    await contactRepository.setPrimary(contact.agencyId.toString(), id);
    if (userId) {
      await logAudit({ resource: 'Contact', resourceId: id, action: 'update', who: userId });
    }
    const updated = await contactRepository.findById(id);
    if (!updated) throw new NotFoundError('Contact');
    return updated.toDTO();
  }
}

export const contactService = new ContactService();
