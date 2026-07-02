import {
  changePasswordSchema,
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  z,
} from '@travel/validation';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { appConfig } from '@/config';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { asyncHandler } from '@/utils';

import type { Router as ExpressRouter } from 'express';

const router: ExpressRouter = Router();

const authRateLimit = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  asyncHandler((req, res) => authController.login(req, res)),
);

router.post(
  '/logout',
  authenticate,
  asyncHandler((req, res) => authController.logout(req, res)),
);

router.post(
  '/logout-all',
  authenticate,
  asyncHandler((req, res) => authController.logoutAll(req, res)),
);

router.post(
  '/refresh',
  asyncHandler((req, res) => authController.refresh(req, res)),
);

router.get(
  '/me',
  authenticate,
  asyncHandler((req, res) => authController.getMe(req, res)),
);

router.put(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler((req, res) => authController.changePassword(req, res)),
);

router.post(
  '/forgot-password',
  authRateLimit,
  validate(forgotPasswordSchema),
  asyncHandler((req, res) => authController.forgotPassword(req, res)),
);

router.post(
  '/reset-password',
  authRateLimit,
  validate(resetPasswordSchema),
  asyncHandler((req, res) => authController.resetPassword(req, res)),
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  asyncHandler((req, res) => authController.verifyEmail(req, res)),
);

router.post(
  '/resend-verification',
  authRateLimit,
  validate(z.object({ email: emailSchema })),
  asyncHandler((req, res) => authController.resendVerification(req, res)),
);

export default router;
