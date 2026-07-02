import { afterAll, afterEach, beforeAll, vi } from 'vitest';

/**
 * Global test setup.
 * Sets the environment to 'test' before any suite runs.
 */

beforeAll(() => {
  process.env['NODE_ENV'] = 'test';
  process.env['MONGODB_URI'] = 'mongodb://localhost:27017/travel_test';
  process.env['LOG_LEVEL'] = 'error'; // suppress logs in tests
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});
