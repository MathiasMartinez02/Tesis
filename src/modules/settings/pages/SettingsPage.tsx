import { Settings, Users, ShieldCheck, Sliders, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { MOCK_USERS } from '@/mocks/users.mock';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants';

const CONFIG_SECTIONS = [
  {
    id: 'users',
    icon: Users,
    title: 'Usuarios',
    description: 'Gestión de cuentas de usuario del sistema',
    iconBg: 'bg-aviation-50',
    iconColor: 'text-aviation-600',
  },
  {
    id: 'roles',
    icon: ShieldCheck,
    title: 'Roles y Permisos',
    description: 'Configuración de roles y niveles de acceso',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'system',
    icon: Sliders,
    title: 'Parámetros del Sistema',
    description: 'Configuración general de SIGMA',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
];

export function SettingsPage(): JSX.Element {
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
      <div className="grid gap-3 sm:grid-cols-3">
        {CONFIG_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="text-left"
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

      {/* Lista de usuarios */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
          Usuarios del sistema
        </h2>
        <Card padding="none">
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {MOCK_USERS.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-aviation-600 text-xs font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-surface-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.licenseNumber && (
                    <span className="font-mono text-xs text-surface-400">{user.licenseNumber}</span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} aria-label={user.isActive ? 'Activo' : 'Inactivo'} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </motion.div>
  );
}
