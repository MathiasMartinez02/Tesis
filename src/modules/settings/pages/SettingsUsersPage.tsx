import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Power, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Spinner } from '@/shared/components/ui/Spinner';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { RoleGuard } from '@/routes/RoleGuard';
import { ROLE_LABELS, ROLE_COLORS, ROUTES } from '@/constants';
import { useUsers, useSetUserActive } from '../hooks/useUsers';
import { UserFormModal } from '../components/UserFormModal';
import { ResetUserPasswordModal } from '../components/ResetUserPasswordModal';
import type { User, UserRole } from '@/types';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

const TABLE_PAGE_SIZE = 15;

// Gestion de usuarios: alta, edicion, activacion y contraseña asignada por el gerente
export function SettingsUsersPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const { data: result, isLoading, isError, refetch } = useUsers({ search: debouncedSearch || undefined }, page, TABLE_PAGE_SIZE);
  const { mutate: setActive, isPending: isTogglingActive } = useSetUserActive();
  const users = result?.data ?? [];

  if (isError) return <ErrorState title="Error al cargar usuarios" onRetry={() => void refetch()} />;

  const openCreateModal = (): void => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User): void => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

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
        <PageHeader title="Usuarios" description="Alta, edición y activación de cuentas del sistema" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por nombre o email..."
          className="max-w-sm"
        />
        <RoleGuard permission="canManageUsers">
          <Button leftIcon={<Plus size={15} />} onClick={openCreateModal}>
            Registrar Usuario
          </Button>
        </RoleGuard>
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-surface-500">
            No se encontraron usuarios.
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-aviation-600 text-xs font-bold text-white">
                    {user.firstName[0]}
                    {user.lastName[0]}
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
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role as UserRole] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {ROLE_LABELS[user.role as UserRole] ?? user.role}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    aria-label={user.isActive ? 'Activo' : 'Inactivo'}
                  />
                  <RoleGuard permission="canManageUsers">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${user.firstName} ${user.lastName}`}
                      onClick={() => openEditModal(user)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Asignar contraseña a ${user.firstName} ${user.lastName}`}
                      onClick={() => setPasswordUser(user)}
                    >
                      <KeyRound size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      isLoading={isTogglingActive}
                      aria-label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                      onClick={() => setActive({ id: user.id, isActive: !user.isActive })}
                    >
                      <Power size={14} className={user.isActive ? 'text-emerald-600' : 'text-surface-400'} />
                    </Button>
                  </RoleGuard>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {result && (
        <Pagination page={page} pageSize={TABLE_PAGE_SIZE} total={result.total} totalPages={result.totalPages} onPageChange={setPage} />
      )}

      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={editingUser} />
      <ResetUserPasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />
    </motion.div>
  );
}
