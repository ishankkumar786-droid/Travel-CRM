import { createApp } from '@/app';

import type { Application } from 'express';

/**
 * Creates a fresh Express app instance for integration testing.
 * Does NOT connect to a real database — mock db in individual tests.
 */
export function createTestApp(): Application {
  return createApp();
}
