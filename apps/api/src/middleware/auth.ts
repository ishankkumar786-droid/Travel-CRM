import { getPermissionsForRole } from '@/constants/permissions';
import { AuthenticationError, AuthorizationError } from '@/errors';
import { userRepository } from '@/repositories/user.repository';
import { verifyAccessToken } from '@/services/jwt.service';

import type { Permission, UserRole } from '@travel/types';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

// ─── Token extraction ─────────────────────────────────────────────────────────

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

// ─── Authenticate middleware ──────────────────────────────────────────────────

/**
 * Verifies the Bearer JWT, loads permissions, and attaches `req.user`.
 * Throws 401 if the token is missing, invalid, or the user no longer exists.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next(new AuthenticationError('No authentication token provided'));
    return;
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    next(err);
    return;
  }

  // Build req.user from the token payload — no DB hit needed for JWT verification
  const permissions = getPermissionsForRole(payload.role);

  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    permissions,
    version: payload.version,
  };

  next();
}

/**
 * Optional authentication.
 * Attaches `req.user` when a valid token is present, but does NOT fail on absence.
 * Useful for public endpoints that behave differently for authenticated users.
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: getPermissionsForRole(payload.role),
      version: payload.version,
    };
  } catch {
    // Silently ignore invalid tokens in optional mode
  }

  next();
}

// ─── Authorization middleware ─────────────────────────────────────────────────

/**
 * Role-based authorization gate.
 * Must be used AFTER `authenticate`.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('admin', 'super_admin'), handler)
 */
export function authorize(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError());
      return;
    }
    next();
  };
}

/**
 * Permission-based authorization gate.
 * Must be used AFTER `authenticate`.
 *
 * Usage:
 *   router.get('/users', authenticate, requirePermission('users.read'), handler)
 */
export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError());
      return;
    }
    const userPerms = req.user.permissions;
    const hasAll = permissions.every((p) => userPerms.includes(p));
    if (!hasAll) {
      next(new AuthorizationError(`Required permissions: ${permissions.join(', ')}`));
      return;
    }
    next();
  };
}

/**
 * Verify that token version matches DB (after password change).
 * Slightly heavier — hits DB. Use on sensitive endpoints only.
 */
export function verifyTokenVersion(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AuthenticationError());
    return;
  }

  const currentUser = req.user;

  userRepository
    .findByIdWithSecrets(currentUser.id)
    .then((user) => {
      if (!user) {
        next(new AuthenticationError('User no longer exists'));
        return;
      }
      if (user.tokenVersion !== currentUser.version) {
        next(new AuthenticationError('Session invalidated. Please login again.'));
        return;
      }
      next();
    })
    .catch(next);
}
