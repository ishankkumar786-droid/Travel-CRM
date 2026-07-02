export * from './permissions';

export const API_V1 = '/api/v1';
export const API_V2 = '/api/v2';

export const ROUTES = {
  HEALTH: '/health',
  READY: '/ready',
  LIVE: '/live',
  DOCS: '/docs',
  AUTH: '/auth',
} as const;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 5 * 60,
  LONG: 60 * 60,
  DAY: 24 * 60 * 60,
} as const;

export const QUEUES = {
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  IMPORT: 'import',
} as const;

export const EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  PASSWORD_CHANGED: 'user.password_changed',
  EMAIL_VERIFIED: 'user.email_verified',
} as const;
