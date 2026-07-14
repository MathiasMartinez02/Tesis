import { Mail, ShieldCheck, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Card } from '@/shared/components/ui/Card';
import { useAuthStore, selectUser } from '@/store/authStore';
import { ROLE_LABELS } from '@/constants';
import { formatDateTime, getInitials } from '@/lib/utils';
import { ChangePasswordCard } from '../components/ChangePasswordCard';

// Pagina de perfil del usuario logueado (Fase 8): antes el boton "Mi Perfil" del Navbar no navegaba a ningun lado.
// Muestra los datos propios del usuario (nombre, email, rol, licencia si tiene, ultimo login) y reusa
// ChangePasswordCard (ya creada en la Fase 7 para SettingsPage) para permitir el cambio de contraseña propia.
export function ProfilePage(): JSX.Element {
  const user = useAuthStore(selectUser);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Mi Perfil" description="Tus datos personales y credenciales de acceso" />

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-aviation-600 text-lg font-semibold text-white">
            {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-surface-500">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-surface-100 pt-5 text-sm sm:grid-cols-2 dark:border-surface-700">
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-surface-400" />
            <div>
              <dt className="text-xs text-surface-500">Email</dt>
              <dd className="font-medium text-surface-900 dark:text-white">{user?.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-surface-400" />
            <div>
              <dt className="text-xs text-surface-500">Rol</dt>
              <dd className="font-medium text-surface-900 dark:text-white">
                {user ? ROLE_LABELS[user.role] : '-'}
              </dd>
            </div>
          </div>
          {user?.licenseNumber && (
            <div className="flex items-center gap-2">
              <Award size={15} className="text-surface-400" />
              <div>
                <dt className="text-xs text-surface-500">Matrícula / Licencia</dt>
                <dd className="font-medium text-surface-900 dark:text-white">{user.licenseNumber}</dd>
              </div>
            </div>
          )}
          {user?.lastLoginAt && (
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-surface-400" />
              <div>
                <dt className="text-xs text-surface-500">Último ingreso</dt>
                <dd className="font-medium text-surface-900 dark:text-white">
                  {formatDateTime(user.lastLoginAt)}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </Card>

      <ChangePasswordCard />
    </motion.div>
  );
}
