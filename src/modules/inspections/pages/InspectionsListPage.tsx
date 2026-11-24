import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { buildRoute, ROUTES, getInspectionTypeLabel } from '@/constants';
import { formatDate } from '@/lib/utils';
import { useInspections } from '../hooks/useInspections';
import type { Inspection, TableColumn } from '@/types';
import { Pagination } from '@/shared/components/Pagination/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

const COLUMNS: TableColumn<Inspection>[] = [
  {
    key: 'workOrderNumber',
    header: 'N° OT',
    width: '160px',
    render: (value) => (
      <span className="font-mono text-xs font-semibold text-aviation-600">{String(value)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '160px',
    render: (_, row) => <StatusBadge type="inspection" status={row.status} />,
  },
  {
    key: 'type',
    header: 'Tipo',
    render: (value) => getInspectionTypeLabel(String(value)),
  },
  {
    key: 'aircraftRegistration',
    header: 'Matrícula',
    width: '110px',
    render: (value) => (
      <span className="font-semibold tracking-wide text-surface-900 dark:text-white">
        {String(value)}
      </span>
    ),
  },
  {
    key: 'inspectorName',
    header: 'Inspector',
    render: (value) =>
      value ? (
        String(value)
      ) : (
        <span className="text-surface-400 italic text-sm">Sin asignar</span>
      ),
  },
  {
    key: 'scheduledDate',
    header: 'Fecha programada',
    sortable: true,
    render: (value) => formatDate(String(value)),
  },
  {
    key: 'aircraftHours',
    header: 'Horas aeronave',
    align: 'right',
    render: (value) => (
      <span className="font-mono text-sm">{Number(value).toLocaleString('es-AR')}h</span>
    ),
  },
];

const TABLE_PAGE_SIZE = 15;

// Listado de inspecciones con busqueda y paginacion del servidor
export function InspectionsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const { data: result, isLoading, isError, refetch } = useInspections({ search: debouncedSearch || undefined }, page, TABLE_PAGE_SIZE);
  const inspections = result?.data ?? [];

  if (isError) return <ErrorState title="Error al cargar inspecciones" onRetry={() => void refetch()} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Inspecciones"
        description={`${result?.total ?? 0} inspecciones en el sistema`}
      />

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por matrícula o N° OT..."
          className="w-72"
        />
      </div>

      {!isLoading && inspections.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin inspecciones"
          description="No hay inspecciones que coincidan con la búsqueda."
        />
      ) : (
        <DataTable<Inspection>
          data={inspections}
          columns={COLUMNS}
          isLoading={isLoading}
          onRowClick={(row) => navigate(buildRoute(ROUTES.INSPECTION_DETAIL, { id: row.id }))}
          emptyMessage="Sin inspecciones"
        />
      )}

      {result && (
        <Pagination page={page} pageSize={TABLE_PAGE_SIZE} total={result.total} totalPages={result.totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  );
}
