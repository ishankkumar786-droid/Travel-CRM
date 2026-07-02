import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import SlowDown from 'express-slow-down';
import helmet from 'helmet';

import { appConfig } from '@/config';
import { sendError } from '@/lib/response';

import type { Application } from 'express';

/**
 * Applies all security middleware to the Express app in the correct order.
 */
export function applySecurityMiddleware(app: Application): void {
  // ─── Secure HTTP headers ──────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ─── Mongo injection sanitization ─────────────────────────────────────────
  app.use(mongoSanitize({ replaceWith: '_' }));

  // ─── Slow-down (progressive delay before hard limit) ──────────────────────
  app.use(
    SlowDown({
      windowMs: appConfig.rateLimit.windowMs,
      delayAfter: Math.floor(appConfig.rateLimit.max * 0.75),
      delayMs: () => 500,
    }),
  );

  // ─── Rate limiter ─────────────────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: appConfig.rateLimit.windowMs,
      max: appConfig.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip ?? 'unknown',
      handler: (_req, res) => {
        sendError(res, 429, 'RATE_LIMIT_ERROR', 'Too many requests, please try again later');
      },
    }),
  );
}
