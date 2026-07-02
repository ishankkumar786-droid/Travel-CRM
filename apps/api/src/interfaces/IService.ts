import type { PaginationMeta, PaginationParams } from '@travel/types';

/**
 * Generic service interface.
 * Business logic layer sits between controllers and repositories.
 */
export interface IService<T, CreateDTO, UpdateDTO> {
  getById(id: string): Promise<T>;
  getAll(params: PaginationParams): Promise<{ items: T[]; pagination: PaginationMeta }>;
  create(dto: CreateDTO): Promise<T>;
  update(id: string, dto: UpdateDTO): Promise<T>;
  remove(id: string): Promise<void>;
}
