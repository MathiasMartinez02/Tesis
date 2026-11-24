import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Plane, ClipboardList, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ROUTES, buildRoute } from '@/constants';
import { useClients } from '../hooks/useClients';
import type { Client } from '@/types';
import { RoleGuard } from '@/routes/RoleGuard';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { clickableProps } from '@/lib/a11y';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

// Tarjeta de cliente: abre el detalle y permite editar
function ClientCard({ client }: { client: Client }): JSX.Element {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      {...clickableProps(() => navigate(buildRoute(ROUTES.CLIENT_DETAIL, { id: client.id })))}
      aria-label={`Cliente ${client.name}`}
      className="cursor-pointer rounded-xl border border-surface-200 bg-white p-5 shadow-card outline-none transition-shadow hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-aviation-500 dark:border-surface-700 dark:bg-surface-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aviation-100 text-sm font-bold text-aviation-700">
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-surface-900 dark:text-white">{client.name}</p>
            <p className="text-xs text-surface-500">{client.taxId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
            {client.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <RoleGuard permission="canManageClients">
            <button
              type="button"
              aria-label={`Editar ${client.name}`}
              onClick={(e) => {
                e.stopPropagation();
                navigate(buildRoute(ROUTES.CLIENT_EDIT, { id: client.id }));
              }}
              className="rounded p-1 text-surface-400 hover:bg-surface-100 hover:text-aviation-600 dark:hover:bg-surface-700"
            >
              <Pencil size={14} />
            </button>
          </RoleGuard>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-surface-600 dark:text-surface-400">
        <p>{client.city}, {client.province}</p>
        <p>{client.email}</p>
        {client.contactPerson && <p>Contacto: {client.contactPerson}</p>}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-surface-100 pt-4 dark:border-surface-700">
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Plane size={13} className="text-aviation-500" />
          <span>{client.aircraftCount} aeronave{client.aircraftCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <ClipboardList size={13} className="text-surface-400" />
          <span>{client.totalWorkOrders} OTs</span>
        </div>
      </div>
    </motion.div>
  );
}

const CARDS_PAGE_SIZE = 12;

// Listado de clientes con busqueda y paginacion del servidor
export function ClientsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data: result, isLoading, isError, refetch } = useClients({ search: debouncedSearch || undefined }, page, CARDS_PAGE_SIZE);
  const clients = result?.data ?? [];

  if (isError) return <ErrorState title="Error al cargar clientes" onRetry={() => void refetch()} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Clientes"
        description={`${result?.total ?? 0} clientes registrados`}
        actions={
          <RoleGuard permission="canManageClients">
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => navigate(ROUTES.CLIENT_NEW)}>
              Registrar Cliente
            </Button>
          </RoleGuard>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Buscar por nombre o CUIT..."
        className="w-72"
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description="No hay clientes que coincidan con la búsqueda."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {result && (
        <Pagination page={page} pageSize={CARDS_PAGE_SIZE} total={result.total} totalPages={result.totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  );
}
