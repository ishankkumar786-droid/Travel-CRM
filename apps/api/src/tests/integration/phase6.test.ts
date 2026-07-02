import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

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

vi.mock('@/services/verification.service', () => ({
  verificationService: {
    getOrCreate: vi.fn().mockResolvedValue({
      id: 'v1',
      agencyId: 'a1',
      stage: 'pending',
      verificationScore: 0,
      confidenceScore: 0,
      checklist: {},
      fields: {},
      history: [],
    }),
    updateStage: vi.fn().mockResolvedValue({ id: 'v1', stage: 'researching' }),
    verifyField: vi.fn().mockResolvedValue({ id: 'v1', stage: 'pending' }),
    getHistory: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/services/notification.service', () => ({
  notificationService: {
    getForUser: vi.fn().mockResolvedValue({
      unreadCount: 2,
      notifications: [
        {
          id: 'n1',
          type: 'system',
          title: 'Test',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
    markRead: vi.fn().mockResolvedValue(undefined),
    markAllRead: vi.fn().mockResolvedValue(undefined),
    countUnread: vi.fn().mockResolvedValue(2),
  },
}));

vi.mock('@/services/settings.service', () => ({
  settingsService: {
    get: vi.fn().mockResolvedValue({
      general: { companyName: 'Test' },
      verification: { minScore: 70 },
      import: { maxFileSizeMb: 10 },
      notifications: {},
    }),
    update: vi.fn().mockResolvedValue({ general: { companyName: 'Updated' } }),
  },
}));

vi.mock('@/services/analytics.service', () => ({
  analyticsService: {
    getSummary: vi.fn().mockResolvedValue({
      agencies: { total: 5, growth: 0, byStatus: {}, byMonth: [] },
      verification: { rate: 40, byStage: {}, avgDaysToVerify: 0 },
      activities: { total: 10, byType: {}, byUser: [] },
      tasks: { completion: 60, overdue: 2, byPriority: {} },
      imports: { total: 1, successRate: 100, totalRows: 50 },
    }),
  },
}));

vi.mock('@/services/audit.service', () => ({
  auditService: {
    list: vi.fn().mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
  },
}));

vi.mock('@/services/user-management.service', () => ({
  userManagementService: {
    list: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'u1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@test.com',
          role: 'admin',
          status: 'active',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    invite: vi.fn().mockResolvedValue({ id: 'u2', email: 'new@test.com', role: 'viewer' }),
    getById: vi.fn().mockResolvedValue({ id: 'u1', email: 'admin@test.com' }),
    updateRole: vi.fn().mockResolvedValue({ id: 'u1', role: 'sales' }),
    updateStatus: vi.fn().mockResolvedValue({ id: 'u1', status: 'inactive' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

const adminToken = signAccessToken({
  userId: '507f1f77bcf86cd799439011',
  email: 'admin@travel.com',
  role: 'admin',
  version: 1,
});
const agencyId = '507f1f77bcf86cd799439011';

describe('Phase 6 Routes', () => {
  const app = createTestApp();

  describe('GET /api/v1/agencies/:id/verification', () => {
    it('returns verification data', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/verification`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.stage).toBe('pending');
    });
    it('returns 401 without token', async () => {
      const res = await request(app).get(`/api/v1/agencies/${agencyId}/verification`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('returns notifications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(2);
    });
  });

  describe('GET /api/v1/settings', () => {
    it('returns system settings', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.general.companyName).toBe('Test');
    });
  });

  describe('GET /api/v1/analytics', () => {
    it('returns analytics summary', async () => {
      const res = await request(app)
        .get('/api/v1/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.agencies.total).toBe(5);
    });
  });

  describe('GET /api/v1/users', () => {
    it('returns user list for admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/audit-logs', () => {
    it('returns audit log list', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
