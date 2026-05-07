import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { SearchInput } from '@/shared/components/SearchInput/SearchInput';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { buildRoute, ROUTES, INSPECTION_TYPE_LABELS } from '@/constants';
import { formatDate } from '@/lib/utils';
import type { Inspection, TableColumn } from '@/types';

// Mock inspections basado en los work orders existentes
const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'ins-001',
    workOrderId: 'ot-002',
    workOrderNumber: 'OT-2024-0002',
    type: 'inspeccion_anual',
    status: 'pendiente_aprobacion',
    aircraftId: 'ac-003',
    aircraftRegistration: 'LV-BCD',
    aircraftModel: 'Beechcraft Bonanza G36',
    aircraftHours: 890,
    inspectorId: 'usr-002',
    inspectorName: 'María González',
    scheduledDate: '2024-01-08',
    startedAt: '2024-01-08T08:00:00Z',
    completedAt: '2024-01-14T17:00:00Z',
    checklist: [],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-14T17:00:00Z',
  },
  {
    id: 'ins-002',
    workOrderId: 'ot-001',
    workOrderNumber: 'OT-2024-0001',
    type: 'inspeccion_100h',
    status: 'en_curso',
    aircraftId: 'ac-002',
    aircraftRegistration: 'LV-MNP',
    aircraftModel: 'Piper PA-28-181',
    aircraftHours: 3421,
    inspectorId: 'usr-002',
    inspectorName: 'María González',
    scheduledDate: '2024-01-12',
    startedAt: '2024-01-12T08:00:00Z',
    checklist: [],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
  },
];

const COLUMNS: TableColumn<Inspection>[] = [
  {
    key: 'workOrderNumber',
    header: 'N° OT',
    width: '130px',
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
    render: (value) => INSPECTION_TYPE_LABELS[value as Inspection['type']],
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
    render: (value) => value ? String(value) : <span className="text-surface-400 italic text-sm">Sin asignar</span>,
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

export function InspectionsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = MOCK_INSPECTIONS.filter((i) =>
    !search ||
    i.aircraftRegistration.toLowerCase().includes(search.toLowerCase()) ||
    i.workOrderNumber.toLowerCase().includes(search.toLowerCase())
  );

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

      {filtered.length === 0 ? (
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
