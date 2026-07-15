import type { BaseEntity, ISODateString, ObjectIdString } from './common';

/** All roles supported across the platform */
export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'researcher'
  | 'sales'
  | 'verification'
  | 'support'
  | 'viewer'
  // Future roles (agency / customer phases)
  | 'agency_owner'
  | 'agency_staff'
  | 'customer';

/** Internal (CRM) roles — require back-office access */
export type InternalRole = Extract<
  UserRole,
  'super_admin' | 'admin' | 'researcher' | 'sales' | 'verification' | 'support' | 'viewer'
>;

/** Account status */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/** Granular permission strings */
export type Permission =
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'agencies.read'
  | 'agencies.write'
  | 'agencies.delete'
  | 'settings.manage'
  | 'dashboard.read'
  | 'reports.read'
  | 'reports.write'
  | 'verification.read'
  | 'verification.write';

/** User preferences stored on the model */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
  };
}

/** Stored refresh-token entry (per device) */
export interface RefreshTokenEntry {
  token: string;
  deviceId: string;
  userAgent?: string | undefined;
  ip?: string | undefined;
  createdAt: ISODateString;
  expiresAt: ISODateString;
}

/** Public user shape returned by the API (no password / tokens) */
export interface UserDTO extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | undefined;
  phone?: string | undefined;
  agencyId?: string | undefined;
  emailVerified: boolean;
  lastLogin?: ISODateString | undefined;
  preferences: UserPreferences;
}

/** Payload embedded inside the JWT access token */
export interface JwtPayload {
  sub: ObjectIdString; // user _id
  email: string;
  role: UserRole;
  version: number; // invalidate on password change
  type: 'access';
}

/** Payload embedded inside the JWT refresh token */
export interface JwtRefreshPayload {
  sub: ObjectIdString;
  deviceId: string;
  version: number;
  type: 'refresh';
}

/** Auth context attached to req.user by the auth middleware */
export interface AuthUser {
  id: ObjectIdString;
  email: string;
  role: UserRole;
  permissions: Permission[];
  version: number;
}

/** Login response */
export interface AuthTokens {
  accessToken: string;
  expiresIn: number; // seconds
}
