import { describe, expect, it } from 'vitest';

import { AuthenticationError } from '@/errors';
import {
  generateDeviceId,
  generateSecureToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/services/jwt.service';

const baseAccess = {
  userId: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  role: 'admin' as const,
  version: 1,
};

const baseRefresh = {
  userId: '507f1f77bcf86cd799439011',
  deviceId: 'device-abc',
  version: 1,
};

describe('signAccessToken / verifyAccessToken', () => {
  it('signs and verifies a valid access token', () => {
    const token = signAccessToken(baseAccess);
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe(baseAccess.userId);
    expect(payload.email).toBe(baseAccess.email);
    expect(payload.role).toBe(baseAccess.role);
    expect(payload.version).toBe(baseAccess.version);
    expect(payload.type).toBe('access');
  });

  it('throws AuthenticationError for tampered token', () => {
    const token = signAccessToken(baseAccess);
    expect(() => verifyAccessToken(token + 'tampered')).toThrow(AuthenticationError);
  });

  it('throws AuthenticationError when using refresh token as access token', () => {
    const refreshToken = signRefreshToken(baseRefresh);
    expect(() => verifyAccessToken(refreshToken)).toThrow(AuthenticationError);
  });
});

describe('signRefreshToken / verifyRefreshToken', () => {
  it('signs and verifies a valid refresh token', () => {
    const token = signRefreshToken(baseRefresh);
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe(baseRefresh.userId);
    expect(payload.deviceId).toBe(baseRefresh.deviceId);
    expect(payload.version).toBe(baseRefresh.version);
    expect(payload.type).toBe('refresh');
  });

  it('throws AuthenticationError for tampered refresh token', () => {
    const token = signRefreshToken(baseRefresh);
    expect(() => verifyRefreshToken(token + 'x')).toThrow(AuthenticationError);
  });

  it('throws when access token used as refresh token', () => {
    const accessToken = signAccessToken(baseAccess);
    expect(() => verifyRefreshToken(accessToken)).toThrow(AuthenticationError);
  });
});

describe('generateSecureToken / hashToken', () => {
  it('generates unique tokens', () => {
    const t1 = generateSecureToken();
    const t2 = generateSecureToken();
    expect(t1).not.toBe(t2);
    expect(t1).toHaveLength(64); // 32 bytes hex
  });

  it('hashes deterministically', () => {
    const token = generateSecureToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('different tokens produce different hashes', () => {
    const t1 = generateSecureToken();
    const t2 = generateSecureToken();
    expect(hashToken(t1)).not.toBe(hashToken(t2));
  });
});

describe('generateDeviceId', () => {
  it('generates UUID-format device IDs', () => {
    const id = generateDeviceId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('generates unique device IDs', () => {
    expect(generateDeviceId()).not.toBe(generateDeviceId());
  });
});
