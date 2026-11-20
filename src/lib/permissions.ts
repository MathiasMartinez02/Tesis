import type { UserPermissions } from '@/types';

export type PermissionKey = keyof UserPermissions;

export type PermissionRequirement = PermissionKey | readonly PermissionKey[];

export const APPOINTMENTS_MANAGE: readonly PermissionKey[] = ['canManageWorkOrders', 'canManageClients'];

export const TECHNICAL_DOCUMENTS_MANAGE: readonly PermissionKey[] = ['canSignDocuments', 'canManageAircraft'];

// Indica si los permisos cumplen el requisito (con lista alcanza cualquiera)
export function hasPermission(
  permissions: UserPermissions | null | undefined,
  requirement: PermissionRequirement
): boolean {
  if (!permissions) return false;
  const required: readonly PermissionKey[] = typeof requirement === 'string' ? [requirement] : requirement;
  return required.some((key) => permissions[key]);
}
