import { describe, expect, it } from 'vitest';
import type { UserRole } from '@/types';
import { PERMISSION_KEYS, ROLE_PERMISSIONS } from './roles';

// Copia de User.GetPermissions() del backend (SIGMA/src/SIGMA.API/Domain/Entities/User.cs)
const BACKEND_PERMISSIONS: Record<UserRole, string[]> = {
  Gerente: [
    'canViewDashboard', 'canManageWorkOrders', 'canApproveInspections',
    'canViewReports', 'canManageAircraft', 'canManageClients',
    'canManageInventory', 'canManageUsers', 'canSignDocuments',
  ],
  OficinaTecnica: ['canViewDashboard', 'canManageWorkOrders', 'canViewReports', 'canManageAircraft', 'canManageClients'],
  Inspector: ['canViewDashboard', 'canApproveInspections', 'canViewReports', 'canSignDocuments'],
  JefeTaller: ['canViewDashboard', 'canManageWorkOrders', 'canManageInventory', 'canViewReports'],
  Mecanico: ['canViewDashboard'],
  Panol: ['canViewDashboard', 'canManageInventory'],
  Administracion: ['canViewDashboard', 'canViewReports', 'canManageClients'],
};

describe('ROLE_PERMISSIONS', () => {
  it.each(Object.keys(BACKEND_PERMISSIONS) as UserRole[])('%s coincide con el backend', (role) => {
    const granted = PERMISSION_KEYS.filter((key) => ROLE_PERMISSIONS[role][key]);
    expect(granted.sort()).toEqual([...BACKEND_PERMISSIONS[role]].sort());
  });

  it('Administracion no gestiona usuarios', () => {
    expect(ROLE_PERMISSIONS.Administracion.canManageUsers).toBe(false);
  });
});
