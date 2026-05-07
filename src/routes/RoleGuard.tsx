import type { ReactNode } from 'react';
import { useAuthStore, selectUserPermissions } from '@/store/authStore';
import type { UserPermissions } from '@/types';

interface RoleGuardProps {
  permission: keyof UserPermissions;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Muestra children solo si el usuario tiene el permiso requerido.
 * Renderiza fallback (o null) si no tiene el permiso.
 */
export function RoleGuard({ permission, fallback = null, children }: RoleGuardProps): JSX.Element {
  const permissions = useAuthStore(selectUserPermissions);

  if (!permissions?.[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
