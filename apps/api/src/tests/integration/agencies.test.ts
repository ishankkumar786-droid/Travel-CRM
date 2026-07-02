import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { signAccessToken } from '@/services/jwt.service';
import { createTestApp } from '@/tests/helpers';

vi.mock('@/database', () => ({
  db: {
    getStatus: () => 'connected',
    isReady: () => true,
    ping: () => Promise.resolve(true),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock('@/services/agency.service', () => ({
  agencyService: {
    list: vi.fn().mockResolvedValue({
      items: [{ id: '507f1f77bcf86cd799439011', name: 'Test Agency', agencyCode: 'AGY00001' }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    create: vi.fn().mockResolvedValue({
      id: '507f1f77bcf86cd799439011',
      name: 'Test Agency',
      agencyCode: 'AGY00001',
    }),
    getById: vi.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011', name: 'Test Agency' }),
    update: vi.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011', name: 'Updated Agency' }),
    delete: vi.fn().mockResolvedValue(undefined),
    archive: vi.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011', status: 'archived' }),
    restore: vi.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011', status: 'inactive' }),
    bulkOperation: vi.fn().mockResolvedValue({ processed: 2, failed: 0 }),
    getStats: vi.fn().mockResolvedValue({
      total: 10,
      active: 5,
      inactive: 3,
      pending: 2,
      archived: 0,
      verified: 4,
      unverified: 6,
      listed: 2,
      addedThisMonth: 1,
      addedThisWeek: 0,
    }),
    exportCsv: vi.fn().mockResolvedValue('Code,Name\n"AGY00001","Test Agency"'),
    exportJson: vi.fn().mockResolvedValue([]),
  },
}));

const adminToken = signAccessToken({
  userId: '507f1f77bcf86cd799439011',
  email: 'admin@travel.com',
  role: 'admin',
  version: 1,
});

const validAgency = {
  name: 'Sunrise Travels',
  ownerName: 'Rahul Sharma',
  email: 'sunrise@travel.com',
  phone: '+919876543210',
  address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
};

describe('Agency Routes', () => {
  const app = createTestApp();

  describe('GET /api/v1/agencies', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/agencies');
      expect(res.status).toBe(401);
    });

    it('returns paginated agencies with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/agencies')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('POST /api/v1/agencies', () => {
    it('creates an agency', async () => {
      const res = await request(app)
        .post('/api/v1/agencies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAgency);
      expect(res.status).toBe(201);
      expect(res.body.data.agencyCode).toBe('AGY00001');
    });

    it('returns 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/agencies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/agencies/:id', () => {
    it('returns agency by id', async () => {
      const res = await request(app)
        .get('/api/v1/agencies/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('GET /api/v1/agencies/stats', () => {
    it('returns agency statistics', async () => {
      const res = await request(app)
        .get('/api/v1/agencies/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBeDefined();
    });
  });

  describe('POST /api/v1/agencies/bulk', () => {
    it('performs bulk archive operation', async () => {
      const res = await request(app)
        .post('/api/v1/agencies/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'], action: 'archive' });
      expect(res.status).toBe(200);
      expect(res.body.data.processed).toBe(2);
    });
  });
});
