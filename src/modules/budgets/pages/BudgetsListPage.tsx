import { useState } from 'react';
import { Plus, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { RoleGuard } from '@/routes/RoleGuard';
import { useBudgets, useUpdateBudgetStatus } from '../hooks/useBudgets';
import { AddBudgetModal } from '../components/AddBudgetModal';
import { BUDGET_STATUS_LABELS } from '@/constants';
import type { Budget, BudgetFilters, BudgetStatus, SelectOption, TableColumn } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const EMPTY_FILTERS: BudgetFilters = {};

const STATUS_OPTIONS: SelectOption[] = Object.entries(BUDGET_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function BudgetsListPage(): JSX.Element {
  const [filters, setFilters] = useState<BudgetFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useBudgets(filters, page);
  const updateStatus = useUpdateBudgetStatus();

  const handleStatusFilterChange = (value: string): void => {
    setFilters(value ? { status: value as BudgetStatus } : {});
    setPage(1);
  };

  // Acepta un presupuesto pendiente
  const handleAccept = (budget: Budget): void => {
    updateStatus.mutate({ id: budget.id, status: 'Aceptado' });
  };

  // Rechaza un presupuesto pendiente
  const handleReject = (budget: Budget): void => {
    updateStatus.mutate({ id: budget.id, status: 'Rechazado' });
  };

  const columns: TableColumn<Budget>[] = [
    {
      key: 'clientName',
      header: 'Cliente',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-surface-900 dark:text-white">{String(value)}</span>
      ),
    },
    {
      key: 'aircraftRegistration',
      header: 'Aeronave',
      render: (value) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{value ? String(value) : '-'}</span>
      ),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (value) => (
        <span className="line-clamp-2 max-w-xs text-sm text-surface-700 dark:text-surface-300">
          {String(value)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-semibold text-surface-900 dark:text-white">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Válido hasta',
      render: (value) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{formatDate(String(value))}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      width: '130px',
      render: (_, row) => <StatusBadge type="budget" status={row.status} />,
    },
    {
      key: 'id',
      header: 'Acciones',
      width: '180px',
      render: (_, row) =>
        row.status === 'Pendiente' ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<CheckCircle2 size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                handleAccept(row);
              }}
            >
              Aceptar
            </Button>
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<XCircle size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row);
              }}
            >
              Rechazar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-surface-400">-</span>
        ),
    },
  ];

  if (isError) {
    return <ErrorState title="Error al cargar los presupuestos" onRetry={() => void refetch()} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Presupuestos"
        description={`${data?.total ?? 0} presupuestos registrados`}
        actions={
          <RoleGuard permission="canManageClients">
            <Button size="sm" leftIcon={<Plus size={15} />} onClick={() => setIsModalOpen(true)}>
              Nuevo Presupuesto
            </Button>
          </RoleGuard>
        }
      />

      {/* Filtro por estado */}
      <div className="max-w-xs rounded-xl border border-surface-200 bg-white p-4 dark:border-surface-700 dark:bg-surface-800">
        <Select
          label="Filtrar por estado"
          options={STATUS_OPTIONS}
          placeholder="Todos los estados"
          value={filters.status ?? ''}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
        />
      </div>

      <DataTable<Budget>
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No hay presupuestos"
        emptyDescription="Creá el primer presupuesto con el botón Nuevo Presupuesto."
        stickyHeader
      />

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>
            Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} de {data.total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
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

      <AddBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}
