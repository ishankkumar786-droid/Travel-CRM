/**
 * Lightweight console abstraction for shared packages.
 * Apps should use their own full logger implementations.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

/** Creates a simple console-based logger with a namespace prefix */
export function createLogger(namespace: string): Logger {
  const prefix = `[${namespace}]`;

  return {
    debug(message, ...args) {
      if (process.env['NODE_ENV'] === 'development') {
        console.debug(`${prefix} ${message}`, ...args);
      }
    },
    info(message, ...args) {
      console.info(`${prefix} ${message}`, ...args);
    },
    warn(message, ...args) {
      console.warn(`${prefix} ${message}`, ...args);
    },
    error(message, ...args) {
      console.error(`${prefix} ${message}`, ...args);
    },
  };
}
