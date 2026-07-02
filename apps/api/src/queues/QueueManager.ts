import { Queue, Worker, type Job } from 'bullmq';

import { appConfig } from '@/config';
import { QUEUES } from '@/constants';
import { logger } from '@/lib/logger';

type JobHandler<T = unknown> = (job: Job<T>) => Promise<void>;

/**
 * BullMQ queue manager.
 * Provides a registry of queues and workers.
 * No jobs are registered here — business queues are added in Phase 3+.
 */
class QueueManager {
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly connection: { host: string; port: number; password?: string; db?: number };

  constructor() {
    this.connection = {
      host: appConfig.redis.host,
      port: appConfig.redis.port,
      ...(appConfig.redis.password && { password: appConfig.redis.password }),
      db: appConfig.redis.db,
    };
  }

  /**
   * Register a queue. Creates it if it doesn't already exist.
   */
  getQueue<T = unknown>(name: string): Queue<T> {
    if (!this.queues.has(name)) {
      const q = new Queue<T>(name, { connection: this.connection });
      this.queues.set(name, q as Queue);
      logger.debug('queue: registered', { name });
    }
    return this.queues.get(name) as Queue<T>;
  }

  /**
   * Register a worker for a queue.
   */
  registerWorker<T = unknown>(name: string, handler: JobHandler<T>): Worker<T> {
    if (this.workers.has(name)) {
      return this.workers.get(name) as Worker<T>;
    }

    const worker = new Worker<T>(name, handler, { connection: this.connection });

    worker.on('completed', (job) => {
      logger.debug('queue: job completed', { queue: name, jobId: job.id });
    });

    worker.on('failed', (job, err) => {
      logger.error('queue: job failed', {
        queue: name,
        jobId: job?.id,
        error: err.message,
      });
    });

    this.workers.set(name, worker as Worker);
    logger.info('queue: worker registered', { queue: name });
    return worker;
  }

  async closeAll(): Promise<void> {
    await Promise.all([
      ...Array.from(this.workers.values()).map((w) => w.close()),
      ...Array.from(this.queues.values()).map((q) => q.close()),
    ]);
    logger.info('queue: all queues and workers closed');
  }

  getQueueNames(): string[] {
    return Object.values(QUEUES);
  }
}

export const queueManager = new QueueManager();
