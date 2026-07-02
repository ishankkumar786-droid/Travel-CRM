import type { PaginationMeta, PaginationParams } from '@travel/types';

/**
 * Generic repository interface.
 * Every model repository implements this contract.
 */
export interface IRepository<T, CreateDTO, UpdateDTO> {
  findById(id: string): Promise<T | null>;
  findAll(params: PaginationParams): Promise<{ items: T[]; pagination: PaginationMeta }>;
  create(dto: CreateDTO): Promise<T>;
  update(id: string, dto: UpdateDTO): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
