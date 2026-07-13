import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { WorkOrderFiltersPanel } from '../components/WorkOrderFiltersPanel';
import { useWorkOrders } from '../hooks/useWorkOrders';
import {
  buildRoute,
  ROUTES,
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  WORK_ORDER_PRIORITY_LABELS,
} from '@/constants';
import type { WorkOrder, WorkOrderFilters, TableColumn } from '@/types';
import { formatDate, downloadBlob } from '@/lib/utils';

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
    key: 'taskCount',
    header: 'Tareas',
    align: 'right',
    width: '100px',
    render: (_, row) => (
      <span className="text-sm text-surface-600 dark:text-surface-400">
        {row.completedTaskCount}/{row.taskCount}
      </span>
    ),
  },
];

const EMPTY_FILTERS: WorkOrderFilters = {};

// Escapa un valor para insertarlo como celda CSV (envuelve en comillas si contiene comas, comillas o saltos de línea)
function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Genera un CSV con las columnas visibles del listado (numero, tipo, aeronave, cliente, estado, prioridad, ingreso, límite) y lo descarga en el navegador
function exportWorkOrdersToCsv(orders: WorkOrder[]): void {
  const headers = [
    'N° OT',
    'Tipo',
    'Aeronave',
    'Cliente',
    'Estado',
    'Prioridad',
    'Fecha de ingreso',
    'Fecha estimada de fin',
  ];
  const rows = orders.map((o) =>
    [
      o.number,
      WORK_ORDER_TYPE_LABELS[o.type],
      o.aircraftRegistration,
      o.clientName,
      WORK_ORDER_STATUS_LABELS[o.status],
      WORK_ORDER_PRIORITY_LABELS[o.priority],
      o.intakeDate ? formatDate(o.intakeDate) : '',
      formatDate(o.estimatedEndDate),
    ]
      .map((cell) => csvEscape(String(cell)))
      .join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([`﻿${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `ordenes-de-trabajo-${new Date().toISOString().split('T')[0]}.csv`);
}

// MODIFICADO: agrega contadores de Pendientes/En proceso/Finalizadas sobre los datos cargados y conecta el botón Exportar a una descarga CSV del lado del cliente
// ANTERIOR: no tenía contadores y el botón Exportar no tenía onClick
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

  // Descarga un CSV con las OT actualmente cargadas (respetando los filtros aplicados)
  const handleExport = (): void => {
    exportWorkOrdersToCsv(data?.data ?? []);
  };

  const orders = data?.data ?? [];
  const pendingCount = orders.filter((o) => o.status === 'Pendiente').length;
  const inProgressCount = orders.filter((o) => o.status === 'EnProceso').length;
  const completedCount = orders.filter((o) => o.status === 'Finalizada').length;

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
              onClick={handleExport}
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

      {/* Contadores por estado (sobre los datos cargados en la página actual) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Pendientes', count: pendingCount, color: 'text-amber-600' },
          { label: 'En proceso', count: inProgressCount, color: 'text-blue-600' },
          { label: 'Finalizadas', count: completedCount, color: 'text-emerald-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              {stat.label}
            </p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.count}</p>
          </Card>
        ))}
      </div>

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
