import { v4 as uuidv4 } from 'uuid';

import type { NextFunction, Request, Response } from 'express';

/**
 * Attaches a unique request ID to every request.
 * Respects an existing `X-Request-Id` header from upstream proxies.
 * The ID is echoed back in the `X-Request-Id` response header
 * and available on `req.id` and `res.req.id` throughout the lifecycle.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.headers['x-request-id'];
  const id = (typeof existing === 'string' ? existing : undefined) ?? uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
