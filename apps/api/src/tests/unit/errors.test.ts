import { describe, expect, it } from 'vitest';

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '@/errors';

describe('Custom Error Classes', () => {
  it('AppError sets properties correctly', () => {
    const err = new AppError(400, 'TEST_ERROR', 'test message', { field: 'value' });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('test message');
    expect(err.details).toEqual({ field: 'value' });
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe('AppError');
  });

  it('ValidationError has correct status and code', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('AuthenticationError has correct status and code', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_ERROR');
  });

  it('AuthorizationError has correct status and code', () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('AUTHORIZATION_ERROR');
  });

  it('NotFoundError formats message from resource name', () => {
    const err = new NotFoundError('Agency');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Agency not found');
  });

  it('ConflictError has correct status and code', () => {
    const err = new ConflictError('Already exists');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT_ERROR');
  });

  it('RateLimitError has correct status and code', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT_ERROR');
  });

  it('errors are instanceof Error', () => {
    expect(new ValidationError('x')).toBeInstanceOf(Error);
    expect(new NotFoundError()).toBeInstanceOf(AppError);
  });
});
