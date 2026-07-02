import { describe, expect, it } from 'vitest';

import { AuthenticationError, AuthorizationError } from '@/errors';
import { authenticate, authorize, requirePermission } from '@/middleware/auth';
import { signAccessToken } from '@/services/jwt.service';
import { mockNext, mockRequest, mockResponse } from '@/tests/helpers';

const validToken = signAccessToken({
  userId: '507f1f77bcf86cd799439011',
  email: 'admin@test.com',
  role: 'admin',
  version: 1,
});

describe('authenticate middleware', () => {
  it('calls next with AuthenticationError when no token', () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthenticationError);
  });

  it('attaches req.user for a valid Bearer token', () => {
    const req = mockRequest({
      headers: { authorization: `Bearer ${validToken}` },
    });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user?.role).toBe('admin');
    expect(req.user?.email).toBe('admin@test.com');
  });

  it('calls next with AuthenticationError for invalid token', () => {
    const req = mockRequest({ headers: { authorization: 'Bearer invalid.token.here' } });
    const res = mockResponse();
    const next = mockNext();

    authenticate(req, res, next);

    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthenticationError);
  });
});

describe('authorize middleware', () => {
  it('passes when user has required role', () => {
    const req = mockRequest();
    req.user = {
      id: '507f1f77bcf86cd799439011',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['users.read'],
      version: 1,
    };
    const next = mockNext();
    const res = mockResponse();

    authorize('admin', 'super_admin')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when user lacks required role', () => {
    const req = mockRequest();
    req.user = {
      id: '507f1f77bcf86cd799439011',
      email: 'a@b.com',
      role: 'viewer',
      permissions: ['dashboard.read'],
      version: 1,
    };
    const next = mockNext();
    const res = mockResponse();

    authorize('admin')(req, res, next);

    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthorizationError);
  });
});

describe('requirePermission middleware', () => {
  it('passes when user has the permission', () => {
    const req = mockRequest();
    req.user = {
      id: '1',
      email: 'a@b.com',
      role: 'admin',
      permissions: ['users.read', 'users.write'],
      version: 1,
    };
    const next = mockNext();
    const res = mockResponse();

    requirePermission('users.read')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects when user lacks the permission', () => {
    const req = mockRequest();
    req.user = {
      id: '1',
      email: 'a@b.com',
      role: 'viewer',
      permissions: ['dashboard.read'],
      version: 1,
    };
    const next = mockNext();
    const res = mockResponse();

    requirePermission('users.delete')(req, res, next);

    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(AuthorizationError);
  });
});
