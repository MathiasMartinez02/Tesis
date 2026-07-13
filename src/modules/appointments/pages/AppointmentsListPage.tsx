import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertTriangle, CheckCircle2, XCircle, ArrowRightCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import {
  useAppointments,
  useUpdateAppointmentStatus,
  useConvertAppointmentToWorkOrder,
} from '../hooks/useAppointments';
import {
  ROUTES,
  buildRoute,
  WORK_ORDER_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from '@/constants';
import type { Appointment, AppointmentFilters, AppointmentStatus, SelectOption, TableColumn } from '@/types';
import { formatDate } from '@/lib/utils';

const EMPTY_FILTERS: AppointmentFilters = {};

const STATUS_OPTIONS: SelectOption[] = Object.entries(APPOINTMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export function AppointmentsListPage(): JSX.Element {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AppointmentFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAppointments(filters, page);
  const updateStatus = useUpdateAppointmentStatus();
  const convertToWorkOrder = useConvertAppointmentToWorkOrder();

  // Ordena los turnos por fecha programada ascendente (los mas cercanos primero)
  const sortedAppointments = [...(data?.data ?? [])].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const handleNewAppointment = (): void => {
    navigate(ROUTES.APPOINTMENT_NEW);
  };

  const handleStatusFilterChange = (value: string): void => {
    setFilters(value ? { ...filters, status: value as AppointmentStatus } : {});
    setPage(1);
  };

  // Confirma un turno solicitado, pasandolo al estado Confirmado
  const handleConfirm = (appointment: Appointment): void => {
    updateStatus.mutate({ id: appointment.id, status: 'Confirmado' });
  };

  // Cancela un turno que todavia no fue convertido en OT
  const handleCancel = (appointment: Appointment): void => {
    updateStatus.mutate({ id: appointment.id, status: 'Cancelado' });
  };

  // Convierte un turno confirmado en una OT real y navega directo a su detalle
  const handleConvert = async (appointment: Appointment): Promise<void> => {
    const workOrder = await convertToWorkOrder.mutateAsync(appointment.id);
    navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: workOrder.id }));
  };

  const columns: TableColumn<Appointment>[] = [
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
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-semibold tracking-wide text-surface-900 dark:text-white">
            {row.aircraftRegistration ?? '-'}
          </span>
          {!row.aircraftId && (
            <span
              title="Aeronave no registrada todavía en el sistema"
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-2xs font-medium text-amber-700 border border-amber-200"
            >
              <AlertTriangle size={10} />
              No registrada
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'requestedType',
      header: 'Tipo',
      render: (value) => (
        <span className="text-sm text-surface-700 dark:text-surface-300">
          {WORK_ORDER_TYPE_LABELS[value as Appointment['requestedType']]}
        </span>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Fecha',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-surface-600 dark:text-surface-400">{formatDate(String(value))}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      width: '150px',
      render: (_, row) => <StatusBadge type="appointment" status={row.status} />,
    },
    {
      key: 'id',
      header: 'Acciones',
      width: '220px',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'Solicitado' && (
            <Button
              variant="outline"
              size="xs"
              leftIcon={<CheckCircle2 size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm(row);
              }}
            >
              Confirmar
            </Button>
          )}
          {row.status !== 'Cancelado' && row.status !== 'ConvertidoOT' && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<XCircle size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(row);
              }}
            >
              Cancelar
            </Button>
          )}
          {row.status === 'Confirmado' && (
            <Button
              variant="primary"
              size="xs"
              leftIcon={<ArrowRightCircle size={13} />}
              onClick={(e) => {
                e.stopPropagation();
                void handleConvert(row);
              }}
            >
              Convertir en OT
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isError) {
    return <ErrorState title="Error al cargar los turnos" onRetry={() => void refetch()} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Turnos"
        description={`${data?.total ?? 0} turnos registrados`}
        actions={
          <Button size="sm" leftIcon={<Plus size={15} />} onClick={handleNewAppointment}>
            Nuevo Turno
          </Button>
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

      <DataTable<Appointment>
        data={sortedAppointments}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No hay turnos"
        emptyDescription="Creá el primer turno con el botón Nuevo Turno."
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
    </motion.div>
  );
}
