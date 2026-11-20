import { describe, expect, it } from 'vitest';
import { mapPermissions } from './auth.service';

describe('mapPermissions', () => {
  it('lee los permisos tal como los envia el backend (camelCase)', () => {
    const permissions = mapPermissions(['canViewDashboard', 'canManageWorkOrders', 'canViewReports']);

    expect(permissions.canViewDashboard).toBe(true);
    expect(permissions.canManageWorkOrders).toBe(true);
    expect(permissions.canViewReports).toBe(true);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('deja todo en false si no hay permisos', () => {
    expect(Object.values(mapPermissions([])).every((value) => !value)).toBe(true);
  });
});
