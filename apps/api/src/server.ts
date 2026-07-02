import { createApp } from './app';
import { appConfig } from './config';
import { db } from './database';
import { logger } from './lib/logger';

/**
 * Application entry point.
 * Boot order: validate env → connect DB → start HTTP server.
 * Handles graceful shutdown on SIGTERM / SIGINT.
 */
async function bootstrap(): Promise<void> {
  logger.info('server: starting', {
    env: appConfig.env,
    version: process.env['npm_package_version'] ?? '0.2.0',
    node: process.version,
  });

  // ─── Database ─────────────────────────────────────────────────────────────
  await db.connect();

  // ─── HTTP server ──────────────────────────────────────────────────────────
  const app = createApp();

  const server = app.listen(appConfig.server.port, appConfig.server.host, () => {
    const base = `http://${appConfig.server.host}:${appConfig.server.port}`;
    logger.info(`server: listening`, {
      url: `${base}${appConfig.server.basePath}`,
      health: `${base}${appConfig.server.basePath}/health`,
      docs: `${base}/api/docs`,
    });
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = (signal: string): void => {
    logger.info(`server: ${signal} received — shutting down`);

    server.close(() => {
      logger.info('server: HTTP server closed');

      db.disconnect()
        .then(() => {
          logger.info('server: shutdown complete');
          process.exit(0);
        })
        .catch((err: unknown) => {
          logger.error('server: error during shutdown', {
            error: err instanceof Error ? err.message : String(err),
          });
          process.exit(1);
        });
    });

    // Hard kill after 15 s
    setTimeout(() => {
      logger.error('server: graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 15_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('server: unhandledRejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    process.exit(1);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('server: uncaughtException', { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

void bootstrap();
