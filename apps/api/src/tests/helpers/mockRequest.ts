import { vi } from 'vitest';

import type { Request, Response } from 'express';

/**
 * Creates a minimal mock Express Request object for unit testing controllers
 * and middleware without needing a running HTTP server.
 */
export function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    id: 'test-request-id',
    method: 'GET',
    path: '/',
    params: {},
    query: {},
    body: {},
    headers: {},
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request;
}

/**
 * Creates a minimal mock Express Response object.
 * Chains status/json/send for fluent assertions.
 */
export function mockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    headersSent: false,
    req: { id: 'test-request-id' },
  } as unknown as Response;
  return res;
}

export function mockNext() {
  return vi.fn();
}
