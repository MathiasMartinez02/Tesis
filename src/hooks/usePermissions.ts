import { useAuthStore, selectUserPermissions } from '@/store/authStore';
import type { UserPermissions } from '@/types';

/**
 * Hook para verificar permisos del usuario autenticado.
 */
export function usePermissions() {
  const permissions = useAuthStore(selectUserPermissions);

  const can = (permission: keyof UserPermissions): boolean => {
    return permissions?.[permission] === true;
  };

  return { can, permissions };
}
