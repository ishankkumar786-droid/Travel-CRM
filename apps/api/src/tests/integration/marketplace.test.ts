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

vi.mock('@/services/onboarding.service', () => ({
  onboardingService: {
    getOrCreate: vi.fn().mockResolvedValue({
      id: 'o1',
      agencyId: 'a1',
      stage: 'invited',
      checklist: {},
      history: [],
      marketplaceEligible: false,
      eligibilityReasons: [],
    }),
    updateStage: vi.fn().mockResolvedValue({ id: 'o1', stage: 'applied' }),
    list: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

vi.mock('@/services/marketplace-profile.service', () => ({
  marketplaceProfileService: {
    getOrCreate: vi.fn().mockResolvedValue({
      id: 'mp1',
      agencyId: 'a1',
      publicSlug: 'test-agency-agy00001',
      isPublic: false,
    }),
    update: vi.fn().mockResolvedValue({ id: 'mp1', description: 'Updated' }),
    getReadiness: vi.fn().mockResolvedValue({
      agencyId: 'a1',
      overallScore: 65,
      isEligible: false,
      missingItems: [],
      recommendations: [],
    }),
  },
}));

vi.mock('@/services/package.service', () => ({
  packageService: {
    create: vi.fn().mockResolvedValue({ id: 'p1', name: 'Goa Beach Package', slug: 'goa-beach-1' }),
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
    getById: vi.fn().mockResolvedValue({ id: 'p1', name: 'Goa Beach Package' }),
    update: vi.fn().mockResolvedValue({ id: 'p1', name: 'Updated Package' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/destination.service', () => ({
  destinationService: {
    list: vi.fn().mockResolvedValue([{ id: 'd1', name: 'Goa', slug: 'goa', type: 'city' }]),
    create: vi.fn().mockResolvedValue({ id: 'd1', name: 'Goa', slug: 'goa' }),
    getBySlug: vi.fn().mockResolvedValue({ id: 'd1', name: 'Goa', slug: 'goa' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/catalog.service', () => ({
  catalogService: {
    getAll: vi.fn().mockResolvedValue({ package_type: [{ id: 'c1', name: 'Honeymoon' }] }),
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 'c1', name: 'Honeymoon' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/public-api.service', () => ({
  publicApiService: {
    listPublicAgencies: vi.fn().mockResolvedValue({
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
    listPublicPackages: vi.fn().mockResolvedValue({
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
    listPublicDestinations: vi.fn().mockResolvedValue([]),
    getPublicAgencyProfile: vi.fn().mockResolvedValue({ publicSlug: 'test-agency' }),
    getRecommendations: vi.fn().mockResolvedValue({
      popularAgencies: [],
      trendingPackages: [],
      recentlyAdded: [],
      featuredAgencies: [],
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

describe('Phase 7 Marketplace Routes', () => {
  const app = createTestApp();

  describe('GET /api/v1/agencies/:id/onboarding', () => {
    it('returns onboarding for agency', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/onboarding`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.stage).toBe('invited');
    });
  });

  describe('GET /api/v1/agencies/:id/marketplace-profile', () => {
    it('returns marketplace profile', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/marketplace-profile`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.publicSlug).toBeDefined();
    });
  });

  describe('GET /api/v1/agencies/:id/marketplace-readiness', () => {
    it('returns readiness score', async () => {
      const res = await request(app)
        .get(`/api/v1/agencies/${agencyId}/marketplace-readiness`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.overallScore).toBeDefined();
    });
  });

  describe('POST /api/v1/agencies/:id/packages', () => {
    it('creates a package', async () => {
      const res = await request(app)
        .post(`/api/v1/agencies/${agencyId}/packages`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Goa Beach Package',
          category: 'Beach',
          durationDays: 5,
          durationNights: 4,
          pricePerPerson: 15000,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Goa Beach Package');
    });
  });

  describe('GET /api/v1/destinations', () => {
    it('returns destinations list', async () => {
      const res = await request(app)
        .get('/api/v1/destinations')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/catalog', () => {
    it('returns full catalog', async () => {
      const res = await request(app)
        .get('/api/v1/catalog')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.package_type).toBeInstanceOf(Array);
    });
  });

  describe('Public API — no auth required', () => {
    it('GET /api/v1/public/agencies returns public agencies', async () => {
      const res = await request(app).get('/api/v1/public/agencies');
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/public/packages returns public packages', async () => {
      const res = await request(app).get('/api/v1/public/packages');
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/public/destinations returns destinations', async () => {
      const res = await request(app).get('/api/v1/public/destinations');
      expect(res.status).toBe(200);
    });
    it('GET /api/v1/public/recommendations returns recommendations', async () => {
      const res = await request(app).get('/api/v1/public/recommendations');
      expect(res.status).toBe(200);
      expect(res.body.data.popularAgencies).toBeInstanceOf(Array);
    });
  });
});
