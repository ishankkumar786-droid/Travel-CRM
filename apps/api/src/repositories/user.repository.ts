import { User, type IUser } from '@/models/user.model';
import { buildPaginationMeta, getSkip } from '@/utils';

import type { UserRole, UserStatus } from '@travel/types';
import type { FilterQuery } from 'mongoose';

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
}

/**
 * Data access layer for the User collection.
 * Controllers/services call only repository methods — never Mongoose directly.
 */
export class UserRepository {
  /** Find a user by ID (excludes deleted) */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  /** Find a user by ID and explicitly select sensitive fields */
  async findByIdWithSecrets(id: string): Promise<IUser | null> {
    return User.findById(id)
      .select('+password +tokenVersion +refreshTokens +passwordChangedAt')
      .exec();
  }

  /** Find a user by email and select password for login comparison */
  async findByEmailForAuth(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +tokenVersion +refreshTokens')
      .exec();
  }

  /** Find a user by email (no secrets) */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  /** Check if email is already taken */
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase().trim() }).exec();
    return count > 0;
  }

  /** Find by password reset token (hashed) */
  async findByPasswordResetToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })
      .select('+password +passwordResetToken +passwordResetExpires +tokenVersion')
      .exec();
  }

  /** Find by email verification token (hashed) */
  async findByVerificationToken(hashedToken: string): Promise<IUser | null> {
    return User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  /** Paginated list with optional filters */
  async findAll(opts: FindUsersOptions) {
    const filter: FilterQuery<IUser> = {};
    if (opts.search) {
      const regex = new RegExp(opts.search, 'i');
      filter['$or'] = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }
    if (opts.role) filter['role'] = opts.role;
    if (opts.status) filter['status'] = opts.status;

    const [items, total] = await Promise.all([
      User.find(filter)
        .skip(getSkip(opts.page, opts.limit))
        .limit(opts.limit)
        .sort({ createdAt: -1 })
        .exec(),
      User.countDocuments(filter).exec(),
    ]);

    return { items, pagination: buildPaginationMeta(opts.page, opts.limit, total) };
  }

  /** Create and persist a new user */
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  /** Update arbitrary fields on a user */
  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).exec();
  }

  /** Soft-delete a user */
  async softDelete(id: string): Promise<boolean> {
    const result = await User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }).exec();
    return result !== null;
  }

  /** Add a refresh token entry (max 5 devices) */
  async addRefreshToken(
    userId: string,
    entry: {
      token: string;
      deviceId: string;
      userAgent?: string | undefined;
      ip?: string | undefined;
      expiresAt: Date;
    },
  ): Promise<void> {
    const expiryBoundary = new Date().toISOString();
    await User.findByIdAndUpdate(userId, {
      // Remove expired tokens and trim to 4 so we can add 1 more (max 5)
      $pull: { refreshTokens: { expiresAt: { $lt: expiryBoundary } } },
    }).exec();

    await User.findByIdAndUpdate(userId, {
      $push: {
        refreshTokens: {
          $each: [
            {
              token: entry.token,
              deviceId: entry.deviceId,
              userAgent: entry.userAgent,
              ip: entry.ip,
              createdAt: new Date().toISOString(),
              expiresAt: entry.expiresAt.toISOString(),
            },
          ],
          $slice: -5,
        },
      },
    }).exec();
  }

  /** Remove a single refresh token (logout one device) */
  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token } },
    }).exec();
  }

  /** Remove all refresh tokens (logout all devices) */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    }).exec();
  }

  /** Update last-login timestamp */
  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { lastLogin: new Date() } }).exec();
  }

  /** Count total users */
  async count(): Promise<number> {
    return User.countDocuments().exec();
  }
}

export const userRepository = new UserRepository();
