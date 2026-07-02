import 'express';

import type { AuthUser } from '@travel/types';

declare global {
  namespace Express {
    interface Request {
      /** Unique request ID (UUID v4 or forwarded from X-Request-Id header) */
      id: string;
      /** Authenticated user — set by authenticate middleware */
      user?: AuthUser | undefined;
    }
  }
}
