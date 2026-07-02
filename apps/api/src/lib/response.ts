import { HTTP_STATUS } from '@travel/config';

import type { PaginationMeta } from '@travel/types';
import type { Response } from 'express';

/**
 * Standard API envelope shapes.
 * Every endpoint uses these helpers — never res.json() directly.
 */

export interface StandardResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  pagination?: PaginationMeta;
  timestamp: string;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  timestamp: string;
  requestId?: string;
}

// ─── Success helpers ──────────────────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HTTP_STATUS.OK,
): void {
  const body: StandardResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.req.id,
  };
  res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

export function sendNoContent(res: Response): void {
  res.status(HTTP_STATUS.NO_CONTENT).send();
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = 'Success',
): void {
  const body: StandardResponse<T[]> = {
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
    requestId: res.req.id,
  };
  res.status(HTTP_STATUS.OK).json(body);
}

// ─── Error helper ─────────────────────────────────────────────────────────────

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  stack?: string,
): void {
  const isDev = process.env['NODE_ENV'] !== 'production';
  const body: ErrorResponse = {
    success: false,
    message,
    error: {
      code,
      ...(details && { details }),
      ...(isDev && stack && { stack }),
    },
    timestamp: new Date().toISOString(),
    requestId: res.req.id,
  };
  res.status(statusCode).json(body);
}
