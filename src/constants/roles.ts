import type { UserRole, UserPermissions } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  Gerente: 'Gerente',
  OficinaTecnica: 'Oficina Técnica',
  Inspector: 'Inspector',
  JefeTaller: 'Jefe de Taller',
  Mecanico: 'Mecánico',
  Panol: 'Pañolero',
  Administracion: 'Administración',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  Gerente: 'bg-purple-100 text-purple-800',
  OficinaTecnica: 'bg-blue-100 text-blue-800',
  Inspector: 'bg-emerald-100 text-emerald-800',
  JefeTaller: 'bg-orange-100 text-orange-800',
  Mecanico: 'bg-gray-100 text-gray-800',
  Panol: 'bg-yellow-100 text-yellow-800',
  Administracion: 'bg-pink-100 text-pink-800',
};

export const PERMISSION_KEYS: (keyof UserPermissions)[] = [
  'canViewDashboard',
  'canManageWorkOrders',
  'canApproveInspections',
  'canManageInventory',
  'canManageUsers',
  'canViewReports',
  'canManageAircraft',
  'canManageClients',
  'canSignDocuments',
];

// Objeto de permisos a partir de la lista del backend
export function buildPermissions(granted: string[]): UserPermissions {
  const set = new Set(granted);
  return Object.fromEntries(PERMISSION_KEYS.map((key) => [key, set.has(key)])) as unknown as UserPermissions;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  Gerente: buildPermissions([
    'canViewDashboard', 'canManageWorkOrders', 'canApproveInspections',
    'canViewReports', 'canManageAircraft', 'canManageClients',
    'canManageInventory', 'canManageUsers', 'canSignDocuments',
  ]),
  OficinaTecnica: buildPermissions([
    'canViewDashboard', 'canManageWorkOrders', 'canViewReports',
    'canManageAircraft', 'canManageClients',
  ]),
  Inspector: buildPermissions(['canViewDashboard', 'canApproveInspections', 'canViewReports', 'canSignDocuments']),
  JefeTaller: buildPermissions(['canViewDashboard', 'canManageWorkOrders', 'canManageInventory', 'canViewReports']),
  Mecanico: buildPermissions(['canViewDashboard']),
  Panol: buildPermissions(['canViewDashboard', 'canManageInventory']),
  Administracion: buildPermissions(['canViewDashboard', 'canViewReports', 'canManageClients']),
};
