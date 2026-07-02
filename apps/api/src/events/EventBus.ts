/* eslint-disable @typescript-eslint/no-misused-promises */
import EventEmitter from 'eventemitter3';

import { logger } from '@/lib/logger';

import type { IEventBus } from '@/interfaces';

type EventHandler = (payload: unknown) => void | Promise<void>;

function safeInvoke(event: string, handler: EventHandler, payload: unknown): void {
  try {
    const result = handler(payload);
    if (result instanceof Promise) {
      result.catch((err: unknown) => {
        logger.error('event:handler error', {
          event,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }
  } catch (err) {
    logger.error('event:handler threw', {
      event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Internal event bus backed by EventEmitter3.
 * Swap the implementation for Redis Pub/Sub or NATS without changing consumers.
 */
class EventBus implements IEventBus {
  private readonly emitter = new EventEmitter();

  emit(event: string, payload: unknown): void {
    logger.debug('event:emit', { event });
    this.emitter.emit(event, payload);
  }

  on(event: string, handler: EventHandler): void {
    this.emitter.on(event, (payload: unknown) => {
      safeInvoke(event, handler, payload);
    });
  }

  off(event: string, handler: EventHandler): void {
    this.emitter.off(event, handler);
  }

  once(event: string, handler: EventHandler): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.emitter.once(event, (payload: unknown) => {
      safeInvoke(event, handler, payload);
    });
  }
}

/** Singleton event bus instance */
export const eventBus = new EventBus();
