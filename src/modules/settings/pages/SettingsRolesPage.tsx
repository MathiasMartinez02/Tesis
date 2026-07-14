import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { ROLE_LABELS, ROLE_PERMISSIONS, ROUTES } from '@/constants';
import type { UserPermissions, UserRole } from '@/types';

// Etiquetas legibles de cada permiso, en el mismo orden en que se evaluan en RoleGuard/sidebar
const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
  canViewDashboard: 'Ver dashboard',
  canManageWorkOrders: 'Gestionar órdenes de trabajo',
  canApproveInspections: 'Aprobar / firmar inspecciones',
  canManageInventory: 'Gestionar inventario (pañol)',
  canManageUsers: 'Gestionar usuarios',
  canViewReports: 'Ver reportes',
  canManageAircraft: 'Gestionar aeronaves',
  canManageClients: 'Gestionar clientes',
  canSignDocuments: 'Firmar documentación técnica',
};

const ROLES = Object.keys(ROLE_LABELS) as UserRole[];
const PERMISSIONS = Object.keys(PERMISSION_LABELS) as (keyof UserPermissions)[];

// Pagina de solo lectura que muestra la matriz rol x permiso (ROLE_PERMISSIONS ya existia en constants/roles.ts, no habia pantalla que la mostrara).
// Decision de diseño (Fase 7): no se agregan roles nuevos "Calidad"/"Direccion" al enum UserRole del backend porque no hay evidencia de que necesiten
// un conjunto de permisos distinto al ya modelado — "Calidad" corresponde al rol Inspector (aprueba inspecciones, firma documentacion) y "Direccion"
// corresponde a Gerente (acceso total, incluye reportes). Ver PLAN_ANALISIS_FUNCIONAL.md, seccion Fase 7, para el detalle de esta decision.
// La matriz tampoco es editable desde la UI porque los permisos estan fijados en el enum del backend (User.GetPermissions()), no en una tabla:
// ofrecer controles de edicion aca seria una funcionalidad falsa que no persiste nada.
export function SettingsRolesPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate(ROUTES.SETTINGS)}
          aria-label="Volver a configuración"
        >
          <ArrowLeft size={18} />
        </Button>
        <PageHeader
          title="Roles y Permisos"
          description="Matriz de permisos por rol (solo lectura, definida en el backend)"
        />
      </div>

      <Card padding="none" className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-surface-100 dark:border-surface-700">
              <th className="px-4 py-3 text-left font-semibold text-surface-500">Permiso</th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-3 text-center font-semibold text-surface-500">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((permission) => (
              <tr key={permission} className="border-b border-surface-50 last:border-0 dark:border-surface-800">
                <td className="px-4 py-2.5 text-surface-700 dark:text-surface-300">
                  {PERMISSION_LABELS[permission]}
                </td>
                {ROLES.map((role) => (
                  <td key={role} className="px-3 py-2.5 text-center">
                    {ROLE_PERMISSIONS[role][permission] ? (
                      <Check size={16} className="mx-auto text-emerald-600" aria-label="Permitido" />
                    ) : (
                      <X size={14} className="mx-auto text-surface-300" aria-label="No permitido" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="text-xs text-surface-400">
        Los roles y sus permisos están definidos en el backend (<code>User.GetPermissions()</code>) y no son editables desde
        esta pantalla. Las áreas de "Calidad" y "Dirección" mencionadas por el Product Owner se mapean a los roles Inspector
        y Gerente respectivamente — ver la decisión documentada en la Fase 7 del plan de análisis funcional.
      </p>
    </motion.div>
  );
}
