import { CatalogItem, generateCatalogSlug } from '@/models/catalog.model';

import type { ServiceCatalogItem } from '@travel/types';
import type { CreateCatalogItemInput } from '@travel/validation';

class CatalogService {
  async create(input: CreateCatalogItemInput): Promise<ServiceCatalogItem> {
    const slug = generateCatalogSlug(input.name);
    const item = await CatalogItem.create({ ...input, slug });
    return (item as { toDTO(): ServiceCatalogItem }).toDTO();
  }

  async list(catalogType?: string): Promise<ServiceCatalogItem[]> {
    const filter: Record<string, unknown> = { isActive: true };
    if (catalogType) filter['catalogType'] = catalogType;
    const items = await CatalogItem.find(filter).sort({ sortOrder: 1, name: 1 }).exec();
    return items.map((i) => (i as { toDTO(): ServiceCatalogItem }).toDTO());
  }

  async getAll(): Promise<Record<string, ServiceCatalogItem[]>> {
    const items = await CatalogItem.find({ isActive: true }).sort({ sortOrder: 1 }).exec();
    const grouped: Record<string, ServiceCatalogItem[]> = {};
    for (const item of items) {
      const dto = (item as { toDTO(): ServiceCatalogItem }).toDTO();
      if (!grouped[dto.catalogType]) grouped[dto.catalogType] = [];
      grouped[dto.catalogType]!.push(dto);
    }
    return grouped;
  }

  async delete(id: string): Promise<void> {
    await CatalogItem.findByIdAndUpdate(id, { $set: { isActive: false } }).exec();
  }
}

export const catalogService = new CatalogService();
