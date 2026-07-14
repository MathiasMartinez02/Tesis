import { Users, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { ROUTES } from '@/constants';
import { ChangePasswordCard } from '../components/ChangePasswordCard';

// MODIFICADO: se quita la tarjeta "Parámetros del Sistema" (antes tercera tarjeta, con id 'system') y se agrega navegación real a las otras dos.
// ANTERIOR: las 3 tarjetas eran botones decorativos sin onClick, ninguna navegaba a ningún lado (las rutas SETTINGS_USERS/SETTINGS_ROLES/SETTINGS_SYSTEM
// estaban definidas en constants/routes.ts pero no montadas en AppRouter.tsx).
// Decision de diseño (Fase 7): no se crea SettingsSystemPage porque hoy no existe ninguna entidad ni endpoint de "parametros del sistema" en el backend
// (no hay casos de uso reales que mostrar) — armar una pantalla ahora seria UI decorativa sin datos, lo que el criterio de salida de esta fase pide evitar.
// Se documenta esta decision en PLAN_ANALISIS_FUNCIONAL.md, seccion Fase 7.
const CONFIG_SECTIONS = [
  {
    id: 'users',
    icon: Users,
    title: 'Usuarios',
    description: 'Gestión de cuentas de usuario del sistema',
    iconBg: 'bg-aviation-50',
    iconColor: 'text-aviation-600',
    route: ROUTES.SETTINGS_USERS,
  },
  {
    id: 'roles',
    icon: ShieldCheck,
    title: 'Roles y Permisos',
    description: 'Configuración de roles y niveles de acceso',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    route: ROUTES.SETTINGS_ROLES,
  },
];

// MODIFICADO: la lista cruda de usuarios se movio a SettingsUsersPage (pagina dedicada, con alta/edicion/activacion real);
// aca queda solo el hub de navegacion (tarjetas) mas la tarjeta de cambio de contraseña propia.
// ANTERIOR: esta pagina renderizaba directamente el listado de usuarios de solo lectura via useUsers()
export function SettingsPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Configuración"
        description="Parámetros del sistema, usuarios y permisos"
      />

      {/* Secciones de configuración */}
      <div className="grid gap-3 sm:grid-cols-2">
        {CONFIG_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="text-left"
              onClick={() => navigate(section.route)}
            >
              <Card hover className="h-full">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${section.iconBg}`}>
                  <Icon size={20} className={section.iconColor} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{section.title}</h3>
                    <p className="mt-0.5 text-xs text-surface-500">{section.description}</p>
                  </div>
                  <ChevronRight size={16} className="mt-0.5 shrink-0 text-surface-400" />
                </div>
              </Card>
            </motion.button>
          );
        })}
      </div>

      {/* Mi cuenta */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
          Mi cuenta
        </h2>
        <ChangePasswordCard />
      </section>
    </motion.div>
  );
}
