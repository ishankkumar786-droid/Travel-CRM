import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import { appConfig } from '@/config';
import { AuthenticationError } from '@/errors';

import type { JwtPayload, JwtRefreshPayload, UserRole } from '@travel/types';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

// Extracted as plain strings to avoid the `as const` StringValue brand issue
const ACCESS_SECRET: string = appConfig.jwt.secret;
const ACCESS_EXPIRES: string = appConfig.jwt.expiresIn;
const REFRESH_SECRET: string = appConfig.jwt.refreshSecret;
const REFRESH_EXPIRES: string = appConfig.jwt.refreshExpiresIn;

export interface SignAccessTokenOptions {
  userId: string;
  email: string;
  role: UserRole;
  version: number;
}

export interface SignRefreshTokenOptions {
  userId: string;
  deviceId: string;
  version: number;
}

export function signAccessToken(opts: SignAccessTokenOptions): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    sub: opts.userId,
    email: opts.email,
    role: opts.role,
    version: opts.version,
    type: 'access',
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as any);
}

export function signRefreshToken(opts: SignRefreshTokenOptions): string {
  const payload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
    sub: opts.userId,
    deviceId: opts.deviceId,
    version: opts.version,
    type: 'refresh',
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as any);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    if (payload.type !== 'access') throw new AuthenticationError('Invalid token type');
    return payload;
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    if (err instanceof jwt.TokenExpiredError) throw new AuthenticationError('Access token expired');
    throw new AuthenticationError('Invalid access token');
  }
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as JwtRefreshPayload;
    if (payload.type !== 'refresh') throw new AuthenticationError('Invalid token type');
    return payload;
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    if (err instanceof jwt.TokenExpiredError)
      throw new AuthenticationError('Refresh token expired');
    throw new AuthenticationError('Invalid refresh token');
  }
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateDeviceId(): string {
  return crypto.randomUUID();
}
