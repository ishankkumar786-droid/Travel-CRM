import { HTTP_STATUS } from '@travel/config';

import { sendError } from '@/lib/response';

import type { NextFunction, Request, Response } from 'express';

/**
 * Catches any request that did not match a registered route.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  sendError(res, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`);
}
