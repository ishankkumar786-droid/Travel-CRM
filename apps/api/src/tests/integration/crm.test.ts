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

vi.mock('@/services/contact.service', () => ({
  contactService: {
    create: vi.fn().mockResolvedValue({
      id: 'c1',
      firstName: 'Jane',
      lastName: 'Doe',
      agencyId: 'a1',
      fullName: 'Jane Doe',
    }),
    listByAgency: vi.fn().mockResolvedValue({
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
    getById: vi.fn().mockResolvedValue({ id: 'c1', firstName: 'Jane', lastName: 'Doe' }),
    update: vi.fn().mockResolvedValue({ id: 'c1', firstName: 'Updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
    setPrimary: vi.fn().mockResolvedValue({ id: 'c1', isPrimary: true }),
  },
}));

vi.mock('@/services/activity.service', () => ({
  activityService: {
    create: vi.fn().mockResolvedValue({ id: 'act1', title: 'Called client', type: 'call' }),
    listByAgency: vi.fn().mockResolvedValue({
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
    getById: vi.fn().mockResolvedValue({ id: 'act1', title: 'Called' }),
    update: vi.fn().mockResolvedValue({ id: 'act1', title: 'Updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/note.service', () => ({
  noteService: {
    create: vi.fn().mockResolvedValue({ id: 'n1', content: 'Test note', isPinned: false }),
    listByAgency: vi.fn().mockResolvedValue({
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
    update: vi.fn().mockResolvedValue({ id: 'n1', content: 'Updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
    togglePin: vi.fn().mockResolvedValue({ id: 'n1', isPinned: true }),
  },
}));

vi.mock('@/services/task.service', () => ({
  taskService: {
    create: vi
      .fn()
      .mockResolvedValue({ id: 't1', title: 'Follow up', priority: 'medium', status: 'pending' }),
    listByAgency: vi.fn().mockResolvedValue({
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
    update: vi.fn().mockResolvedValue({ id: 't1', title: 'Updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
    complete: vi.fn().mockResolvedValue({ id: 't1', status: 'completed' }),
  },
}));

vi.mock('@/services/followup.service', () => ({
  followUpService: {
    create: vi.fn().mockResolvedValue({
      id: 'f1',
      type: 'call',
      status: 'pending',
      scheduledAt: new Date().toISOString(),
    }),
    listByAgency: vi.fn().mockResolvedValue({
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
    update: vi.fn().mockResolvedValue({ id: 'f1' }),
    delete: vi.fn().mockResolvedValue(undefined),
    complete: vi.fn().mockResolvedValue({ id: 'f1', status: 'completed' }),
  },
}));

vi.mock('@/services/timeline.service', () => ({
  timelineService: {
    getForAgency: vi.fn().mockResolvedValue({
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

vi.mock('@/services/search.service', () => ({
  searchService: {
    globalSearch: vi
      .fn()
      .mockResolvedValue({ agencies: [], contacts: [], activities: [], notes: [], tasks: [] }),
  },
}));

vi.mock('@/services/crm-dashboard.service', () => ({
  crmDashboardService: {
    getStats: vi.fn().mockResolvedValue({
      agencies: { total: 5 },
      tasks: { overdue: 0 },
      followups: { dueToday: 1 },
      activities: { recentCount: 3, todayCount: 1 },
    }),
  },
}));

const adminToken = signAccessToken({
  userId: '507f1f77bcf86cd799439011',
  email: 'admin@travel.com',
  role: 'admin',
  version: 1,
});
const agencyId = '507f1f77bcf86cd799439011';
const resourceId = '507f1f77bcf86cd799439012';

describe('CRM Routes', () => {
  const app = createTestApp();

  // ─── Contacts ─────────────────────────────────────────────────────────────
  describe('POST /api/v1/agencies/:id/contacts', () => {
    it('creates a contact', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/contacts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          preferredCommunication: 'email',
          status: 'active',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.fullName).toBe('Jane Doe');
    });
    it('returns 401 without token', async () => {
      const res = await request(app).post(`/api/v1/agencies/${agencyId}/contacts`).send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/agencies/:id/contacts', () => {
    it('lists contacts', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/contacts`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ─── Activities ───────────────────────────────────────────────────────────
  describe('POST /api/v1/agencies/:id/activities', () => {
    it('creates an activity', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/activities`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'call', title: 'Called client' });
      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('call');
    });
  });

  // ─── Notes ────────────────────────────────────────────────────────────────
  describe('POST /api/v1/agencies/:id/notes', () => {
    it('creates a note', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Test note', visibility: 'internal' });
      expect(res.status).toBe(201);
    });
  });

  // ─── Tasks ────────────────────────────────────────────────────────────────
  describe('POST /api/v1/agencies/:id/tasks', () => {
    it('creates a task', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/tasks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Follow up', priority: 'medium', status: 'pending' });
      expect(res.status).toBe(201);
    });
  });

  describe('PATCH /api/v1/tasks/:id/complete', () => {
    it('completes a task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${resourceId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
    });
  });

  // ─── Follow-ups ───────────────────────────────────────────────────────────
  describe('POST /api/v1/agencies/:id/followups', () => {
    it('creates a follow-up', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/followups`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'call', scheduledAt: new Date(Date.now() + 86400000).toISOString() });
      expect(res.status).toBe(201);
    });
  });

  // ─── Timeline ─────────────────────────────────────────────────────────────
  describe('GET /api/v1/agencies/:id/timeline', () => {
    it('returns timeline', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/timeline`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ─── Search ───────────────────────────────────────────────────────────────
  describe('GET /api/v1/search', () => {
    it('returns grouped results', async () => {
      const res = await request(app)
        .get('/api/v1/search?q=test')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.agencies).toBeInstanceOf(Array);
    });
  });

  // ─── CRM Dashboard ────────────────────────────────────────────────────────
  describe('GET /api/v1/dashboard/crm-stats', () => {
    it('returns CRM stats', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/crm-stats')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.agencies).toBeDefined();
    });
  });
});
