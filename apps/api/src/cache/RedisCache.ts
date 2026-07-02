import Redis from 'ioredis';

import { appConfig } from '@/config';
import { logger } from '@/lib/logger';

import type { ICache } from '@/interfaces';

/**
 * Redis-backed cache implementation.
 * Connects lazily — falls back gracefully if Redis is unreachable.
 */
export class RedisCache implements ICache {
  private readonly client: Redis;
  private ready = false;

  constructor() {
    const opts = appConfig.redis.url
      ? { lazyConnect: true }
      : {
          host: appConfig.redis.host,
          port: appConfig.redis.port,
          password: appConfig.redis.password,
          db: appConfig.redis.db,
          lazyConnect: true,
        };

    this.client = appConfig.redis.url ? new Redis(appConfig.redis.url, opts) : new Redis(opts);

    this.client.on('connect', () => {
      this.ready = true;
      logger.info('cache: Redis connected');
    });

    this.client.on('error', (err: Error) => {
      this.ready = false;
      logger.warn('cache: Redis error', { message: err.message });
    });

    this.client.on('close', () => {
      this.ready = false;
      logger.warn('cache: Redis disconnected');
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const count = await this.client.exists(key);
    return count > 0;
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  isReady(): boolean {
    return this.ready;
  }
}
