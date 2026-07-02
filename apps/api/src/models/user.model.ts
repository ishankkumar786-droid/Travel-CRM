import bcrypt from 'bcryptjs';
import mongoose, { type Document, Schema } from 'mongoose';

import { appConfig } from '@/config';

import type {
  RefreshTokenEntry,
  UserDTO,
  UserPreferences,
  UserRole,
  UserStatus,
} from '@travel/types';

/** Mongoose document interface */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | undefined;
  phone?: string | undefined;
  emailVerified: boolean;
  emailVerificationToken?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  lastLogin?: Date | undefined;
  failedLoginAttempts: number;
  lockUntil?: Date | undefined;
  passwordChangedAt?: Date | undefined;
  passwordResetToken?: string | undefined;
  passwordResetExpires?: Date | undefined;
  tokenVersion: number;
  refreshTokens: RefreshTokenEntry[];
  preferences: UserPreferences;
  deletedAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidate: string): Promise<boolean>;
  isLocked(): boolean;
  incrementFailedAttempts(): Promise<void>;
  resetFailedAttempts(): Promise<void>;
  toDTO(): UserDTO;
}

const refreshTokenSchema = new Schema<RefreshTokenEntry>(
  {
    token: { type: String, required: true },
    deviceId: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    createdAt: { type: String, required: true },
    expiresAt: { type: String, required: true },
  },
  { _id: false },
);

const preferencesSchema = new Schema<UserPreferences>(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'researcher',
        'sales',
        'verification',
        'support',
        'viewer',
        'agency_owner',
        'agency_staff',
        'customer',
      ],
      default: 'viewer',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'pending',
    },
    avatar: { type: String },
    phone: { type: String, trim: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    lastLogin: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordChangedAt: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0 },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    preferences: { type: preferencesSchema, default: () => ({}) },
    deletedAt: { type: Date, default: undefined },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email index is created by `unique: true` on the field definition
userSchema.index({ role: 1, status: 1 });
userSchema.index({ status: 1 });
userSchema.index({ deletedAt: 1 });
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

// ─── Pre-save hook — hash password ───────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, appConfig.auth.bcryptRounds);
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
    this.tokenVersion += 1; // invalidate all existing tokens
  }
  next();
});

// ─── Soft-delete query filter ─────────────────────────────────────────────────
userSchema.pre(/^find/, function (this: mongoose.Query<unknown, IUser>, next) {
  void this.where({ deletedAt: { $exists: false } });
  next();
});

// ─── Instance methods ─────────────────────────────────────────────────────────
userSchema.methods['comparePassword'] = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password as string);
};

userSchema.methods['isLocked'] = function (): boolean {
  return this.lockUntil !== undefined && this.lockUntil > new Date();
};

userSchema.methods['incrementFailedAttempts'] = async function (): Promise<void> {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= appConfig.auth.maxFailedAttempts) {
    this.lockUntil = new Date(Date.now() + appConfig.auth.lockDurationMs);
  }
  await (this as IUser).save();
};

userSchema.methods['resetFailedAttempts'] = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  await (this as IUser).save();
};

userSchema.methods['toDTO'] = function (): UserDTO {
  return {
    id: (this._id as mongoose.Types.ObjectId).toString(),
    firstName: this.firstName as string,
    lastName: this.lastName as string,
    email: this.email as string,
    role: this.role as UserRole,
    status: this.status as UserStatus,
    avatar: this.avatar as string | undefined,
    phone: this.phone as string | undefined,
    emailVerified: this.emailVerified as boolean,
    lastLogin: this.lastLogin ? (this.lastLogin as Date).toISOString() : undefined,
    preferences: this.preferences as UserPreferences,
    createdAt: (this.createdAt as Date).toISOString(),
    updatedAt: (this.updatedAt as Date).toISOString(),
  };
};

export const User = mongoose.model<IUser>('User', userSchema);
