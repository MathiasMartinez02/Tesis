import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { WorkOrderFiltersPanel } from '../components/WorkOrderFiltersPanel';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { buildRoute, ROUTES, WORK_ORDER_TYPE_LABELS } from '@/constants';
import type { WorkOrder, WorkOrderFilters, TableColumn } from '@/types';
import { formatDate } from '@/lib/utils';

const COLUMNS: TableColumn<WorkOrder>[] = [
  {
    key: 'number',
    header: 'N° OT',
    sortable: true,
    width: '130px',
    render: (value) => (
      <span className="font-mono text-xs font-semibold text-aviation-600">{String(value)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    width: '140px',
    render: (_, row) => (
      <StatusBadge type="workOrder" status={row.status} />
    ),
  },
  {
    key: 'priority',
    header: 'Prioridad',
    width: '110px',
    render: (_, row) => (
      <StatusBadge type="priority" status={row.priority} showDot={false} />
    ),
  },
  {
    key: 'type',
    header: 'Tipo',
    render: (value) => (
      <span className="text-sm text-surface-700 dark:text-surface-300">
        {WORK_ORDER_TYPE_LABELS[value as WorkOrder['type']]}
      </span>
    ),
  },
  {
    key: 'aircraftRegistration',
    header: 'Matrícula',
    sortable: true,
    width: '110px',
    render: (value) => (
      <span className="font-semibold tracking-wide text-surface-900 dark:text-white">
        {String(value)}
      </span>
    ),
  },
  {
    key: 'clientName',
    header: 'Cliente',
    sortable: true,
    render: (value) => (
      <span className="text-sm text-surface-700 dark:text-surface-300 max-w-[180px] block truncate">
        {String(value)}
      </span>
    ),
  },
  {
    key: 'estimatedEndDate',
    header: 'Fecha Límite',
    sortable: true,
    width: '130px',
    render: (value) => (
      <span className="text-sm text-surface-600 dark:text-surface-400">
        {formatDate(String(value))}
      </span>
    ),
  },
  {
    key: 'assignedInspectorName',
    header: 'Inspector',
    render: (value) => (
      <span className="text-sm text-surface-600 dark:text-surface-400">
        {value ? String(value) : <span className="text-surface-400 italic">Sin asignar</span>}
      </span>
    ),
  },
];

const EMPTY_FILTERS: WorkOrderFilters = {};

export function WorkOrdersListPage(): JSX.Element {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<WorkOrderFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useWorkOrders(filters, page);

  const handleRowClick = (row: WorkOrder): void => {
    navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: row.id }));
  };

  const handleNewOT = (): void => {
    navigate(ROUTES.WORK_ORDER_NEW);
  };

  const handleFiltersChange = (newFilters: WorkOrderFilters): void => {
    setFilters(newFilters);
    setPage(1); // Reset paginación al filtrar
  };

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar las órdenes"
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Órdenes de Trabajo"
        description={`${data?.total ?? 0} órdenes en el sistema`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={15} />}
            >
              Exportar
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus size={15} />}
              onClick={handleNewOT}
            >
              Nueva OT
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <div className="rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
        <WorkOrderFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
        />
      </div>

      {/* Tabla */}
      <DataTable<WorkOrder>
        data={data?.data ?? []}
        columns={COLUMNS}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        emptyMessage="No hay órdenes de trabajo"
        emptyDescription="Creá la primera orden de trabajo con el botón Nueva OT."
        stickyHeader
      />

      {/* Paginación simple */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>
            Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} de {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
