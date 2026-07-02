import { appConfig } from '@/config';
import { logger } from '@/lib/logger';

import { MemoryCache } from './MemoryCache';
import { RedisCache } from './RedisCache';

import type { ICache } from '@/interfaces';

/**
 * Cache factory.
 * Returns a RedisCache if Redis is configured, otherwise falls back to in-memory.
 */
async function createCache(): Promise<ICache> {
  const hasRedis =
    (appConfig.redis.url !== null && appConfig.redis.url !== undefined) ||
    appConfig.redis.host !== 'localhost';

  if (hasRedis) {
    try {
      const redis = new RedisCache();
      await redis.connect();
      return redis;
    } catch (err) {
      logger.warn('cache: Redis unavailable, falling back to memory', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return new MemoryCache();
}

let cacheInstance: ICache | null = null;

export async function getCache(): Promise<ICache> {
  if (!cacheInstance) {
    cacheInstance = await createCache();
  }
  return cacheInstance;
}

export { MemoryCache } from './MemoryCache';
export { RedisCache } from './RedisCache';
