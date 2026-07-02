import { NotFoundError } from '@/errors';
import { Destination, generateDestinationSlug } from '@/models/destination.model';

import type { DestinationDTO } from '@travel/types';
import type { CreateDestinationInput } from '@travel/validation';

class DestinationService {
  async create(input: CreateDestinationInput): Promise<DestinationDTO> {
    const slug = generateDestinationSlug(input.name);
    const dest = await Destination.create({ ...input, slug });
    return (dest as { toDTO(): DestinationDTO }).toDTO();
  }

  async list(opts: { type?: string; parentId?: string; popular?: boolean; featured?: boolean }) {
    const filter: Record<string, unknown> = {};
    if (opts.type) filter['type'] = opts.type;
    if (opts.parentId) filter['parentId'] = opts.parentId;
    if (opts.popular) filter['isPopular'] = true;
    if (opts.featured) filter['isFeatured'] = true;
    const items = await Destination.find(filter).sort({ name: 1 }).exec();
    return items.map((d) => (d as { toDTO(): DestinationDTO }).toDTO());
  }

  async getBySlug(slug: string): Promise<DestinationDTO> {
    const dest = await Destination.findOne({ slug }).exec();
    if (!dest) throw new NotFoundError('Destination');
    return (dest as { toDTO(): DestinationDTO }).toDTO();
  }

  async update(id: string, input: Partial<CreateDestinationInput>): Promise<DestinationDTO> {
    const dest = await Destination.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
    if (!dest) throw new NotFoundError('Destination');
    return (dest as { toDTO(): DestinationDTO }).toDTO();
  }

  async delete(id: string): Promise<void> {
    await Destination.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
  }

  async getPopular(limit = 10): Promise<DestinationDTO[]> {
    const items = await Destination.find({ isPopular: true }).sort({ name: 1 }).limit(limit).exec();
    return items.map((d) => (d as { toDTO(): DestinationDTO }).toDTO());
  }
}

export const destinationService = new DestinationService();
