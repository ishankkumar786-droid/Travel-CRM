import type { Request } from 'express';

/**
 * Extracts a consistent context object from an Express request.
 * Used in logging and error reporting.
 */
export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  ip: string;
  userAgent?: string | undefined;
}

export function getRequestContext(req: Request): RequestContext {
  return {
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip ?? 'unknown',
    userAgent: req.headers['user-agent'],
  };
}
