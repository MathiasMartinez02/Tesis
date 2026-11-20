import { describe, expect, it } from 'vitest';
import { ROLE_PERMISSIONS } from '@/constants/roles';
import { APPOINTMENTS_MANAGE, TECHNICAL_DOCUMENTS_MANAGE, hasPermission } from './permissions';

describe('hasPermission', () => {
  it('sin usuario no hay permiso', () => {
    expect(hasPermission(null, 'canViewDashboard')).toBe(false);
  });

  it('acepta un permiso simple', () => {
    expect(hasPermission(ROLE_PERMISSIONS.Panol, 'canManageInventory')).toBe(true);
    expect(hasPermission(ROLE_PERMISSIONS.Panol, 'canManageWorkOrders')).toBe(false);
  });

  it('Administracion puede gestionar turnos y Mecanico no', () => {
    expect(hasPermission(ROLE_PERMISSIONS.Administracion, APPOINTMENTS_MANAGE)).toBe(true);
    expect(hasPermission(ROLE_PERMISSIONS.Mecanico, APPOINTMENTS_MANAGE)).toBe(false);
  });

  it('Oficina Tecnica puede cargar documentacion tecnica y Panol no', () => {
    expect(hasPermission(ROLE_PERMISSIONS.OficinaTecnica, TECHNICAL_DOCUMENTS_MANAGE)).toBe(true);
    expect(hasPermission(ROLE_PERMISSIONS.Panol, TECHNICAL_DOCUMENTS_MANAGE)).toBe(false);
  });
});
