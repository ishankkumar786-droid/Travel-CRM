import { describe, expect, it } from 'vitest';

import { getPermissionsForRole, hasPermission } from '@/constants/permissions';

describe('getPermissionsForRole', () => {
  it('super_admin has all permissions', () => {
    const perms = getPermissionsForRole('super_admin');
    expect(perms).toContain('users.read');
    expect(perms).toContain('users.write');
    expect(perms).toContain('users.delete');
    expect(perms).toContain('settings.manage');
  });

  it('viewer has minimal permissions', () => {
    const perms = getPermissionsForRole('viewer');
    expect(perms).toContain('dashboard.read');
    expect(perms).not.toContain('users.write');
    expect(perms).not.toContain('users.delete');
  });

  it('customer has no permissions', () => {
    const perms = getPermissionsForRole('customer');
    expect(perms).toHaveLength(0);
  });

  it('researcher can read but not write users', () => {
    const perms = getPermissionsForRole('researcher');
    expect(perms).not.toContain('users.write');
    expect(perms).not.toContain('users.delete');
  });
});

describe('hasPermission', () => {
  it('returns true when role has the permission', () => {
    expect(hasPermission('admin', 'users.read')).toBe(true);
    expect(hasPermission('super_admin', 'users.delete')).toBe(true);
  });

  it('returns false when role lacks the permission', () => {
    expect(hasPermission('viewer', 'users.write')).toBe(false);
    expect(hasPermission('support', 'settings.manage')).toBe(false);
  });
});
