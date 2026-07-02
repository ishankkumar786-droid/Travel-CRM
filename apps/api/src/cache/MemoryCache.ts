import { logger } from '@/lib/logger';

import type { ICache } from '@/interfaces';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * In-memory cache implementation.
 * Used as the fallback when Redis is unavailable.
 * All methods return Promises to satisfy the ICache interface.
 */
export class MemoryCache implements ICache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl: number;

  constructor(defaultTtlSeconds = 300) {
    this.defaultTtl = defaultTtlSeconds;
    logger.info('cache: using in-memory fallback');
  }

  get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    this.store.set(key, {
      value,
      expiresAt: ttl > 0 ? Date.now() + ttl * 1000 : null,
    });
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  exists(key: string): Promise<boolean> {
    return this.get(key).then((v) => v !== null);
  }

  flush(): Promise<void> {
    this.store.clear();
    return Promise.resolve();
  }

  isReady(): boolean {
    return true;
  }
}
