/**
 * Internal event bus interface.
 * Implemented by EventEmitterBus. Swap for a broker (Redis, NATS) later.
 */
export interface IEventBus {
  emit(event: string, payload: unknown): void;
  on(event: string, handler: (payload: unknown) => void | Promise<void>): void;
  off(event: string, handler: (payload: unknown) => void | Promise<void>): void;
  once(event: string, handler: (payload: unknown) => void | Promise<void>): void;
}
