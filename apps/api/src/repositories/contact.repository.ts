import { Contact, type IContact } from '@/models/contact.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { FilterQuery } from 'mongoose';

export class ContactRepository {
  async findById(id: string): Promise<IContact | null> {
    return Contact.findById(id).exec();
  }

  async findByAgency(
    agencyId: string,
    opts: { page: number; limit: number; search?: string; status?: string },
  ) {
    const filter: FilterQuery<IContact> = { agencyId };
    if (opts.status) filter['status'] = opts.status;
    if (opts.search) {
      const rx = new RegExp(opts.search, 'i');
      filter['$or'] = [{ firstName: rx }, { lastName: rx }, { email: rx }, { phone: rx }];
    }
    const [items, total] = await Promise.all([
      Contact.find(filter)
        .sort({ isPrimary: -1, createdAt: -1 })
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .exec(),
      Contact.countDocuments(filter).exec(),
    ]);
    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  async emailExistsForAgency(
    agencyId: string,
    email: string,
    excludeId?: string,
  ): Promise<boolean> {
    const filter: FilterQuery<IContact> = { agencyId, email: email.toLowerCase() };
    if (excludeId) filter['_id'] = { $ne: excludeId };
    return (await Contact.countDocuments(filter).exec()) > 0;
  }

  async create(data: Partial<IContact>): Promise<IContact> {
    const contact = new Contact(data);
    return contact.save();
  }

  async update(id: string, data: Partial<IContact>): Promise<IContact | null> {
    return Contact.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await Contact.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date() },
    }).exec();
    return result !== null;
  }

  /** Set exactly one contact as primary for an agency */
  async setPrimary(agencyId: string, contactId: string): Promise<void> {
    await Contact.updateMany({ agencyId }, { $set: { isPrimary: false } }).exec();
    await Contact.findByIdAndUpdate(contactId, { $set: { isPrimary: true } }).exec();
  }

  async countByAgency(agencyId: string): Promise<number> {
    return Contact.countDocuments({ agencyId }).exec();
  }
}

export const contactRepository = new ContactRepository();
