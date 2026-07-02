import { HTTP_STATUS } from '@travel/config';
import { ZodError } from 'zod';

import { AppError } from '@/errors';
import { logger } from '@/lib/logger';
import { sendError } from '@/lib/response';

import type { NextFunction, Request, Response } from 'express';

/**
 * Global Express error handler — must be the last middleware registered.
 * Normalises all thrown errors into the standard API error envelope.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Already responded
  if (res.headersSent) return;

  // ─── Zod validation error ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors as Record<string, unknown>;
    sendError(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', 'Validation failed', {
      fields: fieldErrors,
    });
    return;
  }

  // ─── Operational AppError ─────────────────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('non-operational error', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        requestId: req.id,
      });
    }
    sendError(res, err.statusCode, err.code, err.message, err.details, err.stack);
    return;
  }

  // ─── Unknown / unexpected error ───────────────────────────────────────────
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error('unhandled error', {
    message,
    stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
  });

  sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    undefined,
    stack,
  );
}
