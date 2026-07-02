import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/travel_test',
      MONGODB_DB_NAME: 'travel_test',
      LOG_LEVEL: 'error',
      SWAGGER_ENABLED: 'false',
      CORS_ORIGINS: 'http://localhost:3000',
      JWT_SECRET: 'test-jwt-secret-at-least-32-characters-long-for-testing',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-chars-long-for-testing',
      JWT_REFRESH_EXPIRES_IN: '7d',
      BCRYPT_ROUNDS: '4', // fast for tests
      MAX_FAILED_LOGIN_ATTEMPTS: '5',
      ACCOUNT_LOCK_DURATION_MS: '900000',
      COOKIE_SECURE: 'false',
      COOKIE_DOMAIN: 'localhost',
      AUTH_RATE_LIMIT_MAX: '100',
    },
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/tests/**',
        'src/types/**',
        '**/*.d.ts',
        'vitest.config.ts',
      ],
    },
    include: ['src/tests/**/*.test.ts'],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
