import { appConfig } from '@/config';
import { AuthenticationError } from '@/errors';
import { sendNoContent, sendSuccess } from '@/lib/response';
import { authService } from '@/services/auth.service';
import { REFRESH_TOKEN_TTL_SECONDS } from '@/services/jwt.service';

import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
} from '@travel/validation';
import type { CookieOptions, Request, Response } from 'express';

/** Shared secure cookie options for the refresh token */
function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite,
    domain: appConfig.isProd ? appConfig.cookie.domain : undefined,
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    path: '/api/v1/auth',
  };
}

function clearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite,
    path: '/api/v1/auth',
  };
}

export class AuthController {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const { email, password, deviceId } = req.body as LoginInput;

    const result = await authService.login(email, password, {
      ...(deviceId !== undefined && { deviceId }),
      ...(req.headers['user-agent'] !== undefined && { userAgent: req.headers['user-agent'] }),
      ...(req.ip !== undefined && { ip: req.ip }),
    });

    // Refresh token goes in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions());

    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
        deviceId: result.deviceId,
      },
      'Login successful',
    );
  }

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;

    if (req.user && refreshToken) {
      await authService.logout(req.user.id, refreshToken);
    }

    res.clearCookie('refreshToken', clearCookieOptions());
    sendNoContent(res);
  }

  /**
   * POST /auth/logout-all
   */
  async logoutAll(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AuthenticationError();
    await authService.logoutAll(req.user.id);
    res.clearCookie('refreshToken', clearCookieOptions());
    sendNoContent(res);
  }

  /**
   * POST /auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) throw new AuthenticationError('No refresh token provided');

    const result = await authService.refresh(refreshToken);

    // Rotate cookie
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions());

    sendSuccess(
      res,
      {
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
      'Token refreshed',
    );
  }

  /**
   * GET /auth/me
   */
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AuthenticationError();
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { user, permissions: req.user.permissions }, 'User profile');
  }

  /**
   * PUT /auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new AuthenticationError();
    const { currentPassword, newPassword } = req.body as ChangePasswordInput;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    // Clear all refresh tokens — force re-login
    res.clearCookie('refreshToken', clearCookieOptions());
    sendNoContent(res);
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body as ForgotPasswordInput;
    await authService.forgotPassword(email);
    // Always return success (prevent enumeration)
    sendSuccess(res, null, 'If that email is registered, a password reset link has been sent.');
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body as ResetPasswordInput;
    await authService.resetPassword(token, newPassword);
    sendNoContent(res);
  }

  /**
   * POST /auth/verify-email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body as { token: string };
    await authService.verifyEmail(token);
    sendSuccess(res, null, 'Email verified successfully');
  }

  /**
   * POST /auth/resend-verification
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };
    await authService.resendVerification(email);
    sendSuccess(res, null, 'Verification email sent if the account exists');
  }
}

export const authController = new AuthController();
