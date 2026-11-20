import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAuthStore, selectUserPermissions } from '@/store/authStore';
import { hasPermission, type PermissionRequirement } from '@/lib/permissions';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/constants';

interface PermissionRouteProps {
  permission: PermissionRequirement;
  children: ReactNode;
}

// Pantalla protegida por permiso; sin acceso muestra un aviso en vez del contenido
export function PermissionRoute({ permission, children }: PermissionRouteProps): JSX.Element {
  const permissions = useAuthStore(selectUserPermissions);
  const navigate = useNavigate();

  if (hasPermission(permissions, permission)) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <ShieldOff size={40} className="text-surface-400" />
      <h1 className="text-lg font-semibold text-surface-900 dark:text-white">No tenés acceso a esta sección</h1>
      <p className="max-w-sm text-sm text-surface-500">
        Tu rol no tiene permiso para ver esta pantalla. Si lo necesitás, pedíselo al gerente.
      </p>
      <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>
        Volver al inicio
      </Button>
    </div>
  );
}
