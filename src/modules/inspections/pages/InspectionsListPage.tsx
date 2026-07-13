import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { buildRoute, ROUTES } from '@/constants';
import { formatDate } from '@/lib/utils';
import { useInspections } from '../hooks/useInspections';
import type { Inspection, TableColumn } from '@/types';

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
    render: (value) => String(value),
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

// MODIFICADO: se quitó el botón "Nueva Inspección" porque el alta ahora se hace desde el detalle de la OT, no desde esta pantalla
// ANTERIOR: el PageHeader incluía un botón "Nueva Inspección" que navegaba a ROUTES.INSPECTION_NEW
export function InspectionsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: result, isLoading } = useInspections({ search }, 1, 50);

  const inspections = result?.data ?? [];

  const filtered = search
    ? inspections.filter(
        (i) =>
          i.aircraftRegistration.toLowerCase().includes(search.toLowerCase()) ||
          i.workOrderNumber.toLowerCase().includes(search.toLowerCase())
      )
    : inspections;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Inspecciones"
        description={`${filtered.length} inspecciones en el sistema`}
      />

      <div className="flex items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por matrícula o N° OT..."
          className="w-72"
        />
      </div>

      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Sin inspecciones"
          description="No hay inspecciones que coincidan con la búsqueda."
        />
      ) : (
        <DataTable<Inspection>
          data={filtered}
          columns={COLUMNS}
          onRowClick={(row) => navigate(buildRoute(ROUTES.INSPECTION_DETAIL, { id: row.id }))}
          emptyMessage="Sin inspecciones"
        />
      )}
    </motion.div>
  );
}
