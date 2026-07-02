import { HTTP_STATUS } from '@travel/config';
import { Router } from 'express';

import { db } from '@/database';
import { sendError, sendSuccess } from '@/lib/response';
import { asyncHandler } from '@/utils';

import type { HealthCheckResponse } from '@travel/types';
import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Full health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const dbStatus = db.getStatus();
    const dbAlive = await db.ping();

    const body: HealthCheckResponse & {
      memory: { heapUsedMb: number; heapTotalMb: number; rssMb: number };
      nodeVersion: string;
    } = {
      status: dbAlive ? 'ok' : 'degraded',
      version: process.env['npm_package_version'] ?? '0.2.0',
      environment: process.env['NODE_ENV'] ?? 'development',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      services: { database: dbStatus },
      memory: {
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      nodeVersion: process.version,
    };

    sendSuccess(res, body, 'Health check');
  }),
);

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 */
router.get('/ready', (_req, res) => {
  const ready = db.isReady();
  if (!ready) {
    sendError(res, HTTP_STATUS.SERVICE_UNAVAILABLE, 'NOT_READY', 'Service not ready');
    return;
  }
  sendSuccess(res, { ready: true }, 'Service ready');
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 */
router.get('/live', (_req, res) => {
  sendSuccess(res, { alive: true, uptimeSeconds: Math.round(process.uptime()) }, 'Service alive');
});

export default router;
