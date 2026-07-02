import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createTestApp } from '@/tests/helpers';

// Mock the DB connection
vi.mock('@/database', () => ({
  db: {
    getStatus: () => 'connected',
    isReady: () => true,
    ping: () => Promise.resolve(true),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Mock the user repository so we don't need a real MongoDB
vi.mock('@/repositories/user.repository', () => {
  const mockUser = {
    _id: { toString: () => '507f1f77bcf86cd799439011' },
    email: 'admin@travel.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    emailVerified: true,
    tokenVersion: 1,
    failedLoginAttempts: 0,
    lockUntil: undefined,
    refreshTokens: [],
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: { email: true, browser: true },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: vi.fn().mockResolvedValue(true),
    isLocked: vi.fn().mockReturnValue(false),
    incrementFailedAttempts: vi.fn().mockResolvedValue(undefined),
    resetFailedAttempts: vi.fn().mockResolvedValue(undefined),
    toDTO: vi.fn().mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      email: 'admin@travel.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      preferences: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    password: 'hashedpw',
    save: vi.fn().mockResolvedValue(undefined),
  };

  return {
    userRepository: {
      findByEmailForAuth: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn().mockResolvedValue(mockUser),
      findByIdWithSecrets: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn().mockResolvedValue(null), // not found — silent return
      addRefreshToken: vi.fn().mockResolvedValue(undefined),
      removeRefreshToken: vi.fn().mockResolvedValue(undefined),
      removeAllRefreshTokens: vi.fn().mockResolvedValue(undefined),
      updateLastLogin: vi.fn().mockResolvedValue(undefined),
    },
  };
});

describe('Auth Routes', () => {
  const app = createTestApp();

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 with accessToken on valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@travel.com', password: 'Password1!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@travel.com');
    });

    it('sets refreshToken httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@travel.com', password: 'Password1!' });

      const cookies = res.headers['set-cookie'] as string[] | undefined;
      expect(cookies?.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
      expect(cookies?.some((c: string) => c.includes('HttpOnly'))).toBe(true);
    });

    it('returns 422 for missing email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ password: 'Password1!' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('returns 422 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Password1!' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns user profile with valid token', async () => {
      // First login to get token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@travel.com', password: 'Password1!' });

      const { accessToken } = loginRes.body.data as { accessToken: string };

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('admin@travel.com');
      expect(res.body.data.permissions).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('always returns 200 regardless of email existence', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });

    it('clears the cookie and returns 204 on valid token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@travel.com', password: 'Password1!' });

      const { accessToken } = loginRes.body.data as { accessToken: string };

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    });
  });
});
