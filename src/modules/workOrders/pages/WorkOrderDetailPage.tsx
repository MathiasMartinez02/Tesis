import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plane, User, Clock, Calendar, Edit, ChevronDown, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { Timeline } from '@/shared/components/Timeline/Timeline';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { useWorkOrder, useUpdateWorkOrderStatus } from '../hooks/useWorkOrders';
import { ScheduleInspectionModal } from '../components/ScheduleInspectionModal';
import { WORK_ORDER_TYPE_LABELS, ROUTES, buildRoute } from '@/constants';
import { formatDate, formatDateTime, formatFlightHours } from '@/lib/utils';
import type { WorkOrder, WorkOrderTaskStatus } from '@/types';

// Estados de la OT en los que tiene sentido programar una inspección
const INSPECTABLE_STATUSES: ReadonlyArray<WorkOrder['status']> = ['EnProceso', 'EnInspeccion'];

const TASK_STATUS_LABELS: Record<WorkOrderTaskStatus, string> = {
  Pendiente: 'Pendiente',
  EnProceso: 'En Proceso',
  Completada: 'Completada',
  Observada: 'Con Observaciones',
};

const TASK_STATUS_COLORS: Record<WorkOrderTaskStatus, string> = {
  Pendiente: 'bg-gray-100 text-gray-600',
  EnProceso: 'bg-blue-100 text-blue-700',
  Completada: 'bg-emerald-100 text-emerald-700',
  Observada: 'bg-amber-100 text-amber-700',
};

const STATUS_OPTIONS: Array<{ value: WorkOrder['status']; label: string }> = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'EnProceso', label: 'En Proceso' },
  { value: 'EnInspeccion', label: 'En Inspección' },
  { value: 'Finalizada', label: 'Finalizada' },
  { value: 'Cancelada', label: 'Cancelada' },
];

// MODIFICADO: agrega el botón "Programar Inspección" (visible en estados EnProceso/EnInspeccion) y el modal asociado para dar de alta la inspección desde la propia OT
// ANTERIOR: solo mostraba el detalle de la OT y el cambio de estado, sin acción para programar inspecciones
export function WorkOrderDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, refetch } = useWorkOrder(id ?? '');
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateWorkOrderStatus();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !order) {
    return (
      <ErrorState
        title="Orden no encontrada"
        description="La OT solicitada no existe o no tenés permisos para verla."
        onRetry={() => void refetch()}
      />
    );
  }

  const completedTasks = order.tasks.filter((t) => t.status === 'Completada').length;
  const progress = order.tasks.length > 0
    ? Math.round((completedTasks / order.tasks.length) * 100)
    : 0;

  const handleStatusChange = (newStatus: WorkOrder['status']): void => {
    updateStatus({ id: order.id, status: newStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(ROUTES.WORK_ORDERS)}
            aria-label="Volver a órdenes"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                {order.number}
              </h1>
              <StatusBadge type="workOrder" status={order.status} />
              <StatusBadge type="priority" status={order.priority} showDot={false} />
            </div>
            <p className="text-sm text-surface-500">
              {WORK_ORDER_TYPE_LABELS[order.type]} · {order.aircraftRegistration} · {order.clientName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={14} />}
            onClick={() => navigate(buildRoute(ROUTES.WORK_ORDER_EDIT, { id: order.id }))}
          >
            Editar
          </Button>
          {INSPECTABLE_STATUSES.includes(order.status) && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CalendarCheck size={14} />}
              onClick={() => setIsScheduleModalOpen(true)}
            >
              Programar Inspección
            </Button>
          )}
          <div className="relative group">
            <Button
              size="sm"
              rightIcon={<ChevronDown size={14} />}
              isLoading={isUpdating}
            >
              Cambiar estado
            </Button>
            <div className="absolute right-0 top-full z-10 mt-1 hidden w-44 rounded-lg border border-surface-200 bg-white py-1 shadow-dropdown group-focus-within:block group-hover:block dark:border-surface-700 dark:bg-surface-800">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={opt.value === order.status}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 disabled:opacity-40 dark:hover:bg-surface-700"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                {order.description}
              </p>
            </CardBody>
          </Card>

          {/* Tareas */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas ({completedTasks}/{order.tasks.length})</CardTitle>
              <span className="text-sm font-semibold text-surface-700 dark:text-white">
                {progress}%
              </span>
            </CardHeader>
            <CardBody>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                <div
                  className="h-full rounded-full bg-aviation-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              {order.tasks.length === 0 ? (
                <p className="text-sm text-surface-400 text-center py-4">No hay tareas definidas</p>
              ) : (
                <div className="space-y-2">
                  {order.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-surface-100 p-3 dark:border-surface-700"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-surface-300 bg-white text-xs font-bold text-surface-500 dark:border-surface-600 dark:bg-surface-800">
                        {task.orderIndex}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {task.title}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-2xs font-medium ${TASK_STATUS_COLORS[task.status]}`}
                          >
                            {TASK_STATUS_LABELS[task.status]}
                          </span>
                          {task.requiresInspection && (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-2xs font-medium text-purple-700">
                              Req. Inspección
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-surface-500">{task.description}</p>
                        {task.assignedToName && (
                          <p className="mt-0.5 text-xs text-surface-400">
                            Asignado a: {task.assignedToName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-surface-700 dark:text-surface-300">
                          {task.actualHours}h / {task.estimatedHours}h
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Eventos</CardTitle>
              </CardHeader>
              <CardBody>
                <Timeline events={order.timeline} />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          {/* Aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Aeronave</CardTitle>
              <Plane size={16} className="text-aviation-500" />
            </CardHeader>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-surface-500">Matrícula</dt>
                  <dd className="font-bold text-surface-900 dark:text-white">
                    {order.aircraftRegistration}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-500">Modelo</dt>
                  <dd className="text-surface-700 dark:text-surface-300 text-right max-w-[60%]">
                    {order.aircraftModel}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-500">Horas al inicio</dt>
                  <dd className="text-surface-700 dark:text-surface-300">
                    {formatFlightHours(order.aircraftHoursAtStart)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-500">Cliente</dt>
                  <dd className="text-surface-700 dark:text-surface-300 text-right max-w-[60%]">
                    {order.clientName}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Personal */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Asignado</CardTitle>
              <User size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {order.assignedMechanics.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-surface-400 mb-1">
                    Mecánicos
                  </p>
                  <div className="space-y-1">
                    {order.assignedMechanics.map((m) => (
                      <p key={m.userId} className="text-sm text-surface-700 dark:text-surface-300">
                        {m.userName}
                        <span className="ml-1 text-xs text-surface-400">· {m.role}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-surface-400 italic">Sin personal asignado</p>
              )}
            </CardBody>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
              <Calendar size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-surface-500">Creada</dt>
                  <dd className="text-surface-700">{formatDate(order.createdAt)}</dd>
                </div>
                {order.startDate && (
                  <div className="flex justify-between">
                    <dt className="text-surface-500">Inicio</dt>
                    <dd className="text-surface-700">{formatDate(order.startDate)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-surface-500">Límite</dt>
                  <dd className="font-medium text-surface-900 dark:text-white">
                    {formatDate(order.estimatedEndDate)}
                  </dd>
                </div>
                {order.completedDate && (
                  <div className="flex justify-between">
                    <dt className="text-surface-500">Completada</dt>
                    <dd className="font-medium text-emerald-600">
                      {formatDateTime(order.completedDate)}
                    </dd>
                  </div>
                )}
              </dl>
            </CardBody>
          </Card>

          {/* Horas */}
          <Card>
            <CardHeader>
              <CardTitle>Horas de Trabajo</CardTitle>
              <Clock size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-surface-500">Progreso</span>
                    <span className="font-medium text-surface-900 dark:text-white">
                      {order.actualHours}h / {order.estimatedHours}h
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                    <div
                      className="h-full rounded-full bg-aviation-500"
                      style={{
                        width: `${Math.min(
                          (order.actualHours / order.estimatedHours) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ScheduleInspectionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        workOrderId={order.id}
      />
    </motion.div>
  );
}
