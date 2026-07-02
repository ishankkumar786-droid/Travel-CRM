import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { appConfig } from '@/config';
import { setupSwagger } from '@/lib/swagger';
import { globalErrorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFound';
import { requestIdMiddleware } from '@/middleware/requestId';
import { requestLogger } from '@/middleware/requestLogger';
import { applySecurityMiddleware } from '@/middleware/security';
import v1Router from '@/routes/v1';

import type { Application } from 'express';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  // ─── Security ─────────────────────────────────────────────────────────────
  applySecurityMiddleware(app);

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || appConfig.cors.origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
    }),
  );

  // ─── Compression ──────────────────────────────────────────────────────────
  app.use(compression());

  // ─── Cookie parser ────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Request ID ───────────────────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ─── Request logging ──────────────────────────────────────────────────────
  app.use(requestLogger);

  // ─── Body parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: appConfig.server.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.server.bodyLimit }));

  // ─── API routes ───────────────────────────────────────────────────────────
  app.use(appConfig.server.basePath, v1Router);

  // ─── Swagger UI ───────────────────────────────────────────────────────────
  setupSwagger(app);

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Global error handler ─────────────────────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}
