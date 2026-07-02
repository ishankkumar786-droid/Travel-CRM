import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createTestApp } from '@/tests/helpers';

// Mock the database so integration tests don't need a real MongoDB
vi.mock('@/database', () => ({
  db: {
    getStatus: () => 'connected',
    isReady: () => true,
    ping: () => Promise.resolve(true),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

describe('Health Routes', () => {
  const app = createTestApp();

  it('GET /api/v1/health returns 200 with health data', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: 'ok',
      services: { database: 'connected' },
    });
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.requestId).toBeDefined();
  });

  it('GET /api/v1/health/ready returns 200 when DB is ready', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.ready).toBe(true);
  });

  it('GET /api/v1/health/live returns 200', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.data.alive).toBe(true);
  });

  it('GET /unknown-route returns 404 with error envelope', async () => {
    const res = await request(app).get('/completely-nonexistent-path-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('response includes X-Request-Id header', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('forwards provided X-Request-Id', async () => {
    const id = 'my-custom-id-123';
    const res = await request(app).get('/api/v1/health').set('X-Request-Id', id);
    expect(res.headers['x-request-id']).toBe(id);
    expect(res.body.requestId).toBe(id);
  });
});
