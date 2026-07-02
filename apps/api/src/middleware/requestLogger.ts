import { logger } from '@/lib/logger';

import type { NextFunction, Request, Response } from 'express';

/**
 * Structured HTTP request logger.
 * Logs method, path, status, duration, and requestId on response finish.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;

    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error('http', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('http', logData);
    } else {
      logger.http('http', logData);
    }
  });

  next();
}
