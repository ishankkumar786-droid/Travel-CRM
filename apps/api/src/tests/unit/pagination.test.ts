import { describe, expect, it } from 'vitest';

import { buildPaginationMeta, getSkip, parsePagination } from '@/utils';

describe('parsePagination', () => {
  it('returns defaults when query is empty', () => {
    const result = parsePagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe('asc');
  });

  it('clamps limit to MAX_LIMIT', () => {
    const result = parsePagination({ limit: '9999' });
    expect(result.limit).toBe(100);
  });

  it('clamps page to minimum 1', () => {
    const result = parsePagination({ page: '-5' });
    expect(result.page).toBe(1);
  });

  it('parses sortOrder correctly', () => {
    expect(parsePagination({ sortOrder: 'desc' }).sortOrder).toBe('desc');
    expect(parsePagination({ sortOrder: 'asc' }).sortOrder).toBe('asc');
    expect(parsePagination({ sortOrder: 'invalid' }).sortOrder).toBe('asc');
  });
});

describe('buildPaginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta(1, 10, 25);
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPreviousPage).toBe(false);
  });

  it('sets hasNextPage false on last page', () => {
    const meta = buildPaginationMeta(3, 10, 25);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPreviousPage).toBe(true);
  });

  it('handles zero total', () => {
    const meta = buildPaginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPreviousPage).toBe(false);
  });
});

describe('getSkip', () => {
  it('returns 0 for page 1', () => {
    expect(getSkip(1, 20)).toBe(0);
  });

  it('calculates skip correctly', () => {
    expect(getSkip(3, 10)).toBe(20);
    expect(getSkip(2, 25)).toBe(25);
  });
});
