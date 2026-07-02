import { appConfig } from '@/config';
import { EVENTS } from '@/constants';
import { getPermissionsForRole } from '@/constants/permissions';
import { AuthenticationError, NotFoundError, ValidationError } from '@/errors';
import { eventBus } from '@/events';
import { logger } from '@/lib/logger';
import { userRepository } from '@/repositories/user.repository';

import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  generateDeviceId,
  generateSecureToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './jwt.service';

import type { AuthTokens, UserDTO } from '@travel/types';

export interface LoginResult {
  user: UserDTO;
  tokens: AuthTokens;
  refreshToken: string;
  deviceId: string;
}

export interface RefreshResult {
  tokens: AuthTokens;
  refreshToken: string;
}

/**
 * Core authentication business logic.
 * Stateless — all state lives in MongoDB (user doc) and JWTs.
 */
class AuthService {
  /**
   * Login with email + password.
   * Uses constant-time comparison to prevent timing attacks.
   * Handles account locking and failed attempt tracking.
   */
  async login(
    email: string,
    password: string,
    deviceInfo?: { deviceId?: string; userAgent?: string; ip?: string },
  ): Promise<LoginResult> {
    // Always fetch user (avoid early return that reveals existence)
    const user = await userRepository.findByEmailForAuth(email);

    // --- Timing-safe: always run bcrypt even if user not found ---
    const DUMMY_HASH = '$2a$12$dummyhashfortimingnormalisation.XXXXXXXXXXXXXXXXXXX';
    const passwordToCheck = user?.password ?? DUMMY_HASH;

    // Validate password (runs even when user is null to prevent enumeration)
    const isValid = user
      ? await user.comparePassword(password)
      : await import('bcryptjs').then((b) => (b.default ?? b).compare(password, passwordToCheck));

    if (!user || !isValid) {
      if (user) await user.incrementFailedAttempts();
      // Generic message to prevent user enumeration
      throw new AuthenticationError('Invalid email or password');
    }

    if (user.isLocked()) {
      throw new AuthenticationError(
        'Account temporarily locked due to too many failed login attempts. Please try again later.',
      );
    }

    if (user.status === 'suspended') {
      throw new AuthenticationError('Your account has been suspended. Please contact support.');
    }

    if (user.status === 'inactive') {
      throw new AuthenticationError('Your account is inactive. Please contact support.');
    }

    // Reset failed attempts on successful login
    await user.resetFailedAttempts();
    await userRepository.updateLastLogin(user._id.toString());

    const deviceId = deviceInfo?.deviceId ?? generateDeviceId();

    // Sign tokens
    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      version: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
      deviceId,
      version: user.tokenVersion,
    });

    // Persist refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    await userRepository.addRefreshToken(user._id.toString(), {
      token: refreshToken,
      deviceId,
      userAgent: deviceInfo?.userAgent,
      ip: deviceInfo?.ip,
      expiresAt,
    });

    eventBus.emit(EVENTS.USER_LOGIN, { userId: user._id.toString() });
    logger.info('auth: login', { userId: user._id.toString(), role: user.role });

    return {
      user: user.toDTO(),
      tokens: { accessToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      refreshToken,
      deviceId,
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   * Rotates the refresh token (old one is revoked, new one issued).
   */
  async refresh(refreshToken: string): Promise<RefreshResult> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await userRepository.findByIdWithSecrets(payload.sub);
    if (!user) throw new AuthenticationError('User no longer exists');

    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    // Version check — password change invalidates all old tokens
    if (payload.version !== user.tokenVersion) {
      throw new AuthenticationError('Token has been invalidated');
    }

    // Verify token is stored (not revoked)
    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      // Possible token reuse attack — revoke all tokens
      await userRepository.removeAllRefreshTokens(user._id.toString());
      logger.warn('auth: refresh token reuse detected — all tokens revoked', {
        userId: user._id.toString(),
      });
      throw new AuthenticationError('Session compromised. Please login again.');
    }

    // Rotate: remove old, issue new
    await userRepository.removeRefreshToken(user._id.toString(), refreshToken);

    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      deviceId: payload.deviceId,
      version: user.tokenVersion,
    });

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    await userRepository.addRefreshToken(user._id.toString(), {
      token: newRefreshToken,
      deviceId: payload.deviceId,
      expiresAt,
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      version: user.tokenVersion,
    });

    return {
      tokens: { accessToken, expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      refreshToken: newRefreshToken,
    };
  }

  /** Logout from current device */
  async logout(userId: string, refreshToken: string): Promise<void> {
    await userRepository.removeRefreshToken(userId, refreshToken);
    eventBus.emit(EVENTS.USER_LOGOUT, { userId });
    logger.info('auth: logout', { userId });
  }

  /** Logout from all devices */
  async logoutAll(userId: string): Promise<void> {
    await userRepository.removeAllRefreshTokens(userId);
    eventBus.emit(EVENTS.USER_LOGOUT, { userId, allDevices: true });
    logger.info('auth: logout all', { userId });
  }

  /** Get current user profile */
  async getMe(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user.toDTO();
  }

  /** Change password (requires current password) */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.findByIdWithSecrets(userId);
    if (!user) throw new NotFoundError('User');

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new ValidationError('Current password is incorrect');

    user.password = newPassword;
    await user.save(); // pre-save hook hashes + bumps tokenVersion

    eventBus.emit(EVENTS.PASSWORD_CHANGED, { userId });
    logger.info('auth: password changed', { userId });
  }

  /**
   * Initiate forgot-password flow.
   * Always returns success to prevent user enumeration.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // silent — don't reveal existence

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepository.update(user._id.toString(), {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    } as Partial<typeof user>);

    // TODO Phase 4: send email via email service
    // await emailService.sendPasswordReset(user.email, rawToken);
    logger.info('auth: password reset token generated', {
      userId: user._id.toString(),
      // In dev, log the raw token for easy testing
      ...(appConfig.isDev && { resetToken: rawToken }),
    });
  }

  /** Reset password using the token from email */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new ValidationError('Password reset token is invalid or has expired');
    }

    user.password = newPassword;
    user.set('passwordResetToken', undefined);
    user.set('passwordResetExpires', undefined);
    await user.save();

    logger.info('auth: password reset completed', { userId: user._id.toString() });
  }

  /** Verify email with token from verification email */
  async verifyEmail(token: string): Promise<void> {
    const hashedToken = hashToken(token);
    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw new ValidationError('Email verification token is invalid or has expired');
    }

    await userRepository.update(user._id.toString(), {
      emailVerified: true,
      status: 'active',
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    } as Partial<typeof user>);

    eventBus.emit(EVENTS.EMAIL_VERIFIED, { userId: user._id.toString() });
    logger.info('auth: email verified', { userId: user._id.toString() });
  }

  /** Resend email verification */
  async resendVerification(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return; // silent
    if (user.emailVerified) return; // already verified

    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await userRepository.update(user._id.toString(), {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expires,
    } as Partial<typeof user>);

    // TODO Phase 4: send email
    logger.info('auth: verification email resent', {
      userId: user._id.toString(),
      ...(appConfig.isDev && { verifyToken: rawToken }),
    });
  }

  /** Build the permission set for a role */
  getPermissionsForRole = getPermissionsForRole;
}

export const authService = new AuthService();
