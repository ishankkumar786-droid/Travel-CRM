import type { Permission, UserRole } from '@travel/types';

/**
 * Role → Permission mapping.
 * Add new permissions here; middleware picks them up automatically.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'users.read',
    'users.write',
    'users.delete',
    'agencies.read',
    'agencies.write',
    'agencies.delete',
    'settings.manage',
    'dashboard.read',
    'reports.read',
    'reports.write',
    'verification.read',
    'verification.write',
  ],
  admin: [
    'users.read',
    'users.write',
    'agencies.read',
    'agencies.write',
    'settings.manage',
    'dashboard.read',
    'reports.read',
    'reports.write',
    'verification.read',
    'verification.write',
  ],
  researcher: ['agencies.read', 'dashboard.read', 'reports.read', 'verification.read'],
  sales: ['agencies.read', 'agencies.write', 'dashboard.read', 'reports.read'],
  verification: ['agencies.read', 'dashboard.read', 'verification.read', 'verification.write'],
  support: ['users.read', 'agencies.read', 'dashboard.read'],
  viewer: ['dashboard.read', 'reports.read'],
  // Future roles — minimal permissions until their phases are built
  agency_owner: ['agencies.read', 'agencies.write'],
  agency_staff: ['agencies.read'],
  customer: [],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
