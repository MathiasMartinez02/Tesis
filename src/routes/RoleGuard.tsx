import type { ReactNode } from 'react';
import { useAuthStore, selectUserPermissions } from '@/store/authStore';
import { hasPermission, type PermissionRequirement } from '@/lib/permissions';

interface RoleGuardProps {
  permission: PermissionRequirement;
  fallback?: ReactNode;
  children: ReactNode;
}

// Muestra children solo si el usuario tiene el permiso (o alguno de la lista)
export function RoleGuard({ permission, fallback = null, children }: RoleGuardProps): JSX.Element {
  const permissions = useAuthStore(selectUserPermissions);

  return <>{hasPermission(permissions, permission) ? children : fallback}</>;
}
