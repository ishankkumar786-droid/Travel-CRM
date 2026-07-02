import path from 'path';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { appConfig } from '@/config';
import { logger } from '@/lib/logger';

import type { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Travel Marketplace API',
      version: '2.0.0',
      description: 'Production REST API for the Travel Marketplace platform.',
      contact: { name: 'Travel Marketplace Team' },
    },
    servers: [
      {
        url: `http://localhost:${appConfig.server.port}${appConfig.server.basePath}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                details: { type: 'object' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPreviousPage: { type: 'boolean' },
          },
        },
      },
    },
    tags: [{ name: 'Health', description: 'Health and liveness probes' }],
  },
  apis: [path.join(__dirname, '../routes/**/*.ts'), path.join(__dirname, '../routes/**/*.js')],
};

export function setupSwagger(app: Application): void {
  if (!appConfig.swagger.enabled) return;

  const spec = swaggerJsdoc(options);

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'Travel API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  );

  // Raw spec endpoint
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });

  logger.info(`api: Swagger UI → http://localhost:${appConfig.server.port}/api/docs`);
}
