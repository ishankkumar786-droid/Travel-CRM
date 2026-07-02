import { env } from './env';

export const appConfig = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProd: env.NODE_ENV === 'production',

  server: {
    host: env.API_HOST,
    port: env.API_PORT,
    basePath: env.API_BASE_PATH,
    bodyLimit: env.REQUEST_BODY_LIMIT,
  },

  db: {
    uri: env.MONGODB_URI,
    name: env.MONGODB_DB_NAME,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    serverSelectionTimeoutMs: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    connectTimeoutMs: env.MONGODB_CONNECT_TIMEOUT_MS,
  },

  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },

  cors: {
    origins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    authMax: env.AUTH_RATE_LIMIT_MAX,
  },

  logging: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
  },

  swagger: {
    enabled: env.SWAGGER_ENABLED,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  auth: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    maxFailedAttempts: env.MAX_FAILED_LOGIN_ATTEMPTS,
    lockDurationMs: env.ACCOUNT_LOCK_DURATION_MS,
  },

  cookie: {
    secure: env.COOKIE_SECURE,
    domain: env.COOKIE_DOMAIN,
    httpOnly: true,
    sameSite: 'strict' as const,
  },
} as const;

export type AppConfig = typeof appConfig;
