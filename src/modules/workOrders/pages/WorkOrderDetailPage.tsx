import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  User,
  Clock,
  Calendar,
  Edit,
  ChevronDown,
  Ban,
  ClipboardCheck,
  ListPlus,
  PackagePlus,
  FilePlus2,
  FileText,
  PackageCheck,
  PackageX,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { Timeline } from '@/shared/components/Timeline/Timeline';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { RoleGuard } from '@/routes/RoleGuard';
import {
  useWorkOrder,
  useUpdateWorkOrderStatus,
  useUpdateMaterialStatus,
  useAddWorkOrderDocument,
} from '../hooks/useWorkOrders';
import { DocumentFormModal } from '@/shared/components/DocumentFormModal/DocumentFormModal';
import { WorkOrderTaskItem } from '../components/WorkOrderTaskItem';
import { useAuthStore, selectUser, selectUserPermissions } from '@/store/authStore';
import { AddTaskModal } from '../components/AddTaskModal';
import { AddMaterialModal } from '../components/AddMaterialModal';
import {
  WORK_ORDER_TYPE_LABELS,
  WORK_ORDER_STATUS_LABELS,
  ROUTES,
  buildRoute,
  getInspectionTypeLabel,
} from '@/constants';
import { formatDate, formatDateTime, formatFlightHours } from '@/lib/utils';
import type { WorkOrder, WorkOrderMaterialStatus } from '@/types';

// Etiquetas y colores del estado de un material de OT
const MATERIAL_STATUS_LABELS: Record<WorkOrderMaterialStatus, string> = {
  Pendiente: 'Pendiente',
  Entregado: 'Entregado',
  NoDisponible: 'No Disponible',
};

const MATERIAL_STATUS_COLORS: Record<WorkOrderMaterialStatus, string> = {
  Pendiente: 'bg-gray-100 text-gray-600',
  Entregado: 'bg-emerald-100 text-emerald-700',
  NoDisponible: 'bg-red-100 text-red-700',
};

// Detalle de OT: estado, tareas, materiales, inspecciones e historial
export function WorkOrderDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, refetch } = useWorkOrder(id ?? '');
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateWorkOrderStatus();
  const currentUser = useAuthStore(selectUser);
  const permissions = useAuthStore(selectUserPermissions);
  const { mutate: updateMaterialStatus } = useUpdateMaterialStatus();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const addDocument = useAddWorkOrderDocument(id ?? '');

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
  const progress =
    order.tasks.length > 0 ? Math.round((completedTasks / order.tasks.length) * 100) : 0;

  const isClosed = order.status === 'Finalizada' || order.status === 'Cancelada';
  const canManage = !!permissions?.canManageWorkOrders && !isClosed;
  const isAssignedToOrder = order.assignedMechanics.some((m) => m.userId === currentUser?.id);
  const statusOptions = order.allowedTransitions.filter((s) => s !== 'Cancelada');
  const canCancel = order.allowedTransitions.includes('Cancelada');

  // Cambia el estado de la OT; cancelar pide confirmacion
  const handleStatusChange = (newStatus: WorkOrder['status']): void => {
    if (
      newStatus === 'Cancelada' &&
      !window.confirm(
        `¿Cancelar la OT ${order.number}? Esta acción quedará registrada en el historial de la orden.`
      )
    ) {
      return;
    }
    updateStatus({ id: order.id, status: newStatus });
  };

  // Marca un material como Entregado o No Disponible
  const handleUpdateMaterialStatus = (
    materialId: string,
    status: WorkOrderMaterialStatus
  ): void => {
    updateMaterialStatus({ workOrderId: order.id, materialId, status });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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
              <h1 className="text-xl font-bold text-surface-900 dark:text-white">{order.number}</h1>
              <StatusBadge type="workOrder" status={order.status} />
              <StatusBadge type="priority" status={order.priority} showDot={false} />
            </div>
            <p className="text-sm text-surface-500">
              {WORK_ORDER_TYPE_LABELS[order.type]} · {order.aircraftRegistration} ·{' '}
              {order.clientName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isClosed && (
            <RoleGuard permission="canManageWorkOrders">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit size={14} />}
                onClick={() => navigate(buildRoute(ROUTES.WORK_ORDER_EDIT, { id: order.id }))}
              >
                Editar
              </Button>
            </RoleGuard>
          )}
          <RoleGuard permission="canManageWorkOrders">
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                leftIcon={<Ban size={14} />}
                isLoading={isUpdating}
                onClick={() => handleStatusChange('Cancelada')}
              >
                Cancelar OT
              </Button>
            )}
            {statusOptions.length > 0 && (
              <div className="group relative">
                <Button size="sm" rightIcon={<ChevronDown size={14} />} isLoading={isUpdating}>
                  Cambiar estado
                </Button>
                <div className="absolute right-0 top-full z-10 mt-1 hidden w-44 rounded-lg border border-surface-200 bg-white py-1 shadow-dropdown group-focus-within:block group-hover:block dark:border-surface-700 dark:bg-surface-800">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-50 dark:hover:bg-surface-700"
                    >
                      {WORK_ORDER_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </RoleGuard>
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
              <p className="text-sm leading-relaxed text-surface-700 dark:text-surface-300">
                {order.description}
              </p>
            </CardBody>
          </Card>

          {/* Tareas */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tareas ({completedTasks}/{order.tasks.length})
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-surface-700 dark:text-white">
                  {progress}%
                </span>
                {canManage && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ListPlus size={14} />}
                    onClick={() => setIsAddTaskModalOpen(true)}
                  >
                    Agregar Tarea
                  </Button>
                )}
              </div>
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
                <p className="py-4 text-center text-sm text-surface-400">No hay tareas definidas</p>
              ) : (
                <div className="space-y-2">
                  {order.tasks.map((task) => (
                    <WorkOrderTaskItem
                      key={task.id}
                      task={task}
                      workOrderId={order.id}
                      mechanics={order.assignedMechanics}
                      canManage={canManage}
                      canWork={
                        !isClosed &&
                        (!!permissions?.canManageWorkOrders ||
                          isAssignedToOrder ||
                          task.assignedToId === currentUser?.id)
                      }
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materiales ({order.materials.length})</CardTitle>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<PackagePlus size={14} />}
                  onClick={() => setIsAddMaterialModalOpen(true)}
                >
                  Pedir Material
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {order.materials.length === 0 ? (
                <p className="py-4 text-center text-sm text-surface-400">
                  No hay materiales pedidos
                </p>
              ) : (
                <div className="space-y-2">
                  {order.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-start gap-3 rounded-lg border border-surface-100 p-3 dark:border-surface-700"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">
                            {material.partNumber}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-2xs font-medium ${MATERIAL_STATUS_COLORS[material.status]}`}
                          >
                            {MATERIAL_STATUS_LABELS[material.status]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-surface-500">{material.description}</p>
                        <p className="mt-0.5 text-xs text-surface-400">
                          {material.quantity} {material.unit} · Pedido el{' '}
                          {formatDate(material.requestedAt)}
                          {material.deliveredAt &&
                            ` · Entregado el ${formatDate(material.deliveredAt)}`}
                        </p>
                      </div>
                      {material.status === 'Pendiente' && canManage && (
                        <RoleGuard permission="canManageWorkOrders">
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Marcar entregado"
                              title="Marcar entregado"
                              onClick={() => handleUpdateMaterialStatus(material.id, 'Entregado')}
                            >
                              <PackageCheck size={16} className="text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Marcar no disponible"
                              title="Marcar no disponible"
                              onClick={() =>
                                handleUpdateMaterialStatus(material.id, 'NoDisponible')
                              }
                            >
                              <PackageX size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </RoleGuard>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inspecciones</CardTitle>
            </CardHeader>
            <CardBody>
              {order.inspections.length === 0 ? (
                <p className="text-sm text-surface-500">
                  La inspección se genera automáticamente al pasar la OT a En Inspección.
                </p>
              ) : (
                <div className="space-y-2">
                  {order.inspections.map((inspection) => (
                    <button
                      key={inspection.id}
                      type="button"
                      onClick={() =>
                        navigate(buildRoute(ROUTES.INSPECTION_DETAIL, { id: inspection.id }))
                      }
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-surface-100 p-3 text-left hover:bg-surface-50 dark:border-surface-700 dark:hover:bg-surface-800"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardCheck size={16} className="text-aviation-600" />
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white">
                            {getInspectionTypeLabel(inspection.type)}
                          </p>
                          <p className="text-xs text-surface-500">
                            {formatDate(inspection.scheduledDate)}
                            {inspection.rejectionReason &&
                              ` · Rechazo: ${inspection.rejectionReason}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge type="inspection" status={inspection.status} />
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos ({order.documents.length})</CardTitle>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<FilePlus2 size={14} />}
                  onClick={() => setIsAddDocumentModalOpen(true)}
                >
                  Adjuntar documento
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {order.documents.length === 0 ? (
                <p className="py-4 text-center text-sm text-surface-400">Sin documentos adjuntos</p>
              ) : (
                <ul className="space-y-2">
                  {order.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-surface-100 p-3 dark:border-surface-700"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText size={16} className="shrink-0 text-aviation-600" />
                        <div className="min-w-0">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-medium text-aviation-600 hover:underline"
                          >
                            {doc.name}
                          </a>
                          <p className="text-xs text-surface-500">
                            {doc.type} · {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

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
                  <dd className="max-w-[60%] text-right text-surface-700 dark:text-surface-300">
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
                  <dd className="max-w-[60%] text-right text-surface-700 dark:text-surface-300">
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
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-surface-400">
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
                <p className="text-sm italic text-surface-400">Sin personal asignado</p>
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
                {order.intakeDate && (
                  <div className="flex justify-between">
                    <dt className="text-surface-500">Ingreso</dt>
                    <dd className="text-surface-700">{formatDate(order.intakeDate)}</dd>
                  </div>
                )}
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

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        workOrderId={order.id}
      />
      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        workOrderId={order.id}
      />
      <DocumentFormModal
        isOpen={isAddDocumentModalOpen}
        title="Adjuntar documento"
        description={`Documento de la OT ${order.number}`}
        typePlaceholder="Formulario 337, Orden de compra, Foto..."
        isPending={addDocument.isPending}
        onSubmit={(values) => addDocument.mutateAsync({ name: values.name, type: values.type, fileUrl: values.fileUrl })}
        onClose={() => setIsAddDocumentModalOpen(false)}
      />
    </motion.div>
  );
}
