import { sendError } from '@/lib/response';

import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodSchema } from 'zod';

type ValidateTarget = 'body' | 'params' | 'query';

/**
 * Zod-based validation middleware factory.
 *
 * Usage:
 *   router.post('/', validate(MySchema), asyncHandler(controller.create));
 *   router.get('/',  validate(QuerySchema, 'query'), asyncHandler(controller.list));
 */
export function validate(schema: ZodSchema, target: ValidateTarget = 'body'): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, unknown>;
      sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed', { fields: fieldErrors });
      return;
    }

    if (target === 'body') {
      req.body = result.data as Record<string, unknown>;
    } else if (target === 'params') {
      req.params = result.data as Record<string, string>;
    } else {
      req.query = result.data as Record<string, string>;
    }

    next();
  };
}
