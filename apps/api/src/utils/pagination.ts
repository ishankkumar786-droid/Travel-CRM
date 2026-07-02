import { PAGINATION } from '@travel/config';

import type { PaginationMeta, PaginationParams } from '@travel/types';

/**
 * Builds a safe, bounded PaginationParams from raw query input.
 */
export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query['page'] ?? 1), 10) || 1);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(
      1,
      parseInt(String(query['limit'] ?? PAGINATION.DEFAULT_LIMIT), 10) || PAGINATION.DEFAULT_LIMIT,
    ),
  );

  const rawSortBy = query['sortBy'];
  const sortBy: string | undefined =
    typeof rawSortBy === 'string' && rawSortBy ? rawSortBy : undefined;

  const sortOrder: 'asc' | 'desc' = query['sortOrder'] === 'desc' ? 'desc' : 'asc';

  const rawSearch = query['search'];
  const search: string | undefined =
    typeof rawSearch === 'string' && rawSearch ? rawSearch : undefined;

  const params: PaginationParams = { page, limit, sortOrder };
  if (sortBy !== undefined) params.sortBy = sortBy;
  if (search !== undefined) params.search = search;

  return params;
}

/**
 * Builds the standard PaginationMeta object from page/limit/total.
 */
export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculates the MongoDB skip value from page + limit.
 */
export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
