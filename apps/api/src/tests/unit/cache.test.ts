import { beforeEach, describe, expect, it } from 'vitest';

import { MemoryCache } from '@/cache';

describe('MemoryCache', () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache();
  });

  it('returns null for missing key', async () => {
    expect(await cache.get('missing')).toBeNull();
  });

  it('stores and retrieves a value', async () => {
    await cache.set('key', { foo: 'bar' });
    const val = await cache.get<{ foo: string }>('key');
    expect(val).toEqual({ foo: 'bar' });
  });

  it('expires values after TTL', async () => {
    await cache.set('temp', 'value', 0.001); // ~1 ms TTL
    await new Promise((r) => setTimeout(r, 10));
    expect(await cache.get('temp')).toBeNull();
  });

  it('deletes a key', async () => {
    await cache.set('del', 'x');
    await cache.del('del');
    expect(await cache.get('del')).toBeNull();
  });

  it('exists returns true/false correctly', async () => {
    await cache.set('exists', 1);
    expect(await cache.exists('exists')).toBe(true);
    expect(await cache.exists('nope')).toBe(false);
  });

  it('flush clears all entries', async () => {
    await cache.set('a', 1);
    await cache.set('b', 2);
    await cache.flush();
    expect(await cache.get('a')).toBeNull();
    expect(await cache.get('b')).toBeNull();
  });

  it('isReady always returns true', () => {
    expect(cache.isReady()).toBe(true);
  });
});
