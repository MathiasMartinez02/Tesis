import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Plane, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ROUTES } from '@/constants';
import { useClients } from '../hooks/useClients';
import type { Client, ClientFilters } from '@/types';

function ClientCard({ client }: { client: Client }): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer rounded-xl border border-surface-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-800"
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
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {client.isActive ? 'Activo' : 'Inactivo'}
        </span>
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

export function ClientsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ClientFilters>({});

  const { data: result, isLoading } = useClients(filters, 1, 50);
  const clients = result?.data ?? [];

  const filtered = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.taxId.includes(search)
      )
    : clients;

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
          <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => navigate(ROUTES.CLIENT_NEW)}>
            Nuevo cliente
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setFilters((f) => ({ ...f, search: v || undefined }));
        }}
        placeholder="Buscar por nombre o CUIT..."
        className="w-72"
      />

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description="No hay clientes que coincidan con la búsqueda."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
