import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  Cog,
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  Pencil,
  Wrench,
  Package,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { PageLoader } from '@/shared/components/PageLoader/PageLoader';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { Spinner } from '@/shared/components/ui/Spinner';
import {
  useAircraftById,
  useAircraftMaintenanceHistory,
  useAircraftInventoryUsage,
} from '../hooks/useAircraft';
import { AddAircraftDocumentModal } from '../components/AddAircraftDocumentModal';
import { ROUTES, buildRoute, WORK_ORDER_TYPE_LABELS } from '@/constants';
import { formatDate, formatFlightHours, daysUntil } from '@/lib/utils';

// MODIFICADO: agrega sección "Repuestos utilizados" con los items de inventory-usage de la aeronave
// ANTERIOR: agregaba botón "Editar" en el header, sección "Historial de mantenimiento" con las OTs de la
// aeronave y conectaba el botón "Subir documento" a un modal que crea documentos vía useAddAircraftDocument
export function AircraftDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: aircraft, isLoading, isError, refetch } = useAircraftById(id ?? '');
  const {
    data: maintenanceHistory,
    isLoading: isLoadingHistory,
  } = useAircraftMaintenanceHistory(id ?? '');
  const {
    data: inventoryUsage,
    isLoading: isLoadingInventoryUsage,
  } = useAircraftInventoryUsage(id ?? '');
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  if (isLoading) return <PageLoader />;
  if (isError || !aircraft) {
    return (
      <ErrorState
        title="Aeronave no encontrada"
        onRetry={() => void refetch()}
      />
    );
  }

  const daysToInspection = aircraft.nextInspectionDue ? daysUntil(aircraft.nextInspectionDue) : null;
  const daysToCertExpiry = daysUntil(aircraft.certificateExpiry);

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
            onClick={() => navigate(ROUTES.AIRCRAFT)}
            aria-label="Volver a aeronaves"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aviation-600">
              <Plane size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                  {aircraft.registration}
                </h1>
                <StatusBadge type="aircraft" status={aircraft.status} />
              </div>
              <p className="text-sm text-surface-500">
                {aircraft.manufacturer} {aircraft.model} · {aircraft.year}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Pencil size={14} />}
          onClick={() => navigate(buildRoute(ROUTES.AIRCRAFT_EDIT, { id: aircraft.id }))}
        >
          Editar
        </Button>
      </div>

      {/* Alertas de vencimiento */}
      {((daysToInspection !== null && daysToInspection <= 30) || daysToCertExpiry <= 30) && (
        <div className="space-y-2">
          {daysToInspection !== null && daysToInspection <= 30 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/10">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                {daysToInspection < 0
                  ? `Inspección vencida hace ${Math.abs(daysToInspection)} días`
                  : `Próxima inspección en ${daysToInspection} días (${formatDate(aircraft.nextInspectionDue!)})`}
              </p>
            </div>
          )}
          {daysToCertExpiry <= 30 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/10">
              <AlertTriangle size={16} className="shrink-0 text-red-600" />
              <p className="text-sm font-medium text-red-800 dark:text-red-400">
                Certificado de aeronavegabilidad vence en {daysToCertExpiry} días
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Info principal */}
        <div className="space-y-5 lg:col-span-2">
          {/* Datos técnicos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Técnicos</CardTitle>
            </CardHeader>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Serie</dt>
                  <dd className="mt-1 font-mono text-surface-900 dark:text-white">{aircraft.serialNumber}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Motor</dt>
                  <dd className="mt-1 text-surface-700 dark:text-surface-300">{aircraft.engineModel}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Serie Motor</dt>
                  <dd className="mt-1 font-mono text-surface-700 dark:text-surface-300">{aircraft.engineSerialNumber}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Año</dt>
                  <dd className="mt-1 text-surface-700 dark:text-surface-300">{aircraft.year}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Categoría</dt>
                  <dd className="mt-1 text-surface-700 dark:text-surface-300">{aircraft.category}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-surface-400 text-xs uppercase tracking-wide">Cliente</dt>
                  <dd className="mt-1 text-surface-700 dark:text-surface-300">{aircraft.clientName}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Horas y aterrizajes */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">Horas totales</p>
                    <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">
                      {formatFlightHours(aircraft.totalFlightHours)}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50">
                    <Clock size={18} className="text-aviation-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">Aterrizajes</p>
                    <p className="mt-1 text-2xl font-bold text-surface-900 dark:text-white">
                      {aircraft.totalLandings.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <Plane size={18} className="text-emerald-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">Próx. insp.</p>
                    <p
                      className={`mt-1 text-2xl font-bold ${
                        daysToInspection !== null && daysToInspection <= 30
                          ? 'text-amber-600'
                          : 'text-surface-900 dark:text-white'
                      }`}
                    >
                      {aircraft.nextInspectionHours}h
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <Cog size={18} className="text-purple-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Historial de mantenimiento: OTs asociadas a la aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de mantenimiento</CardTitle>
              <Wrench size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {isLoadingHistory ? (
                <div className="flex h-20 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : !maintenanceHistory || maintenanceHistory.length === 0 ? (
                <EmptyState
                  icon={Wrench}
                  title="Sin órdenes de trabajo"
                  description="Esta aeronave todavía no tiene OTs de mantenimiento registradas."
                />
              ) : (
                <div className="divide-y divide-surface-100 dark:divide-surface-700">
                  {maintenanceHistory.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() =>
                        navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: order.id }))
                      }
                      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-aviation-600">{order.number}</p>
                        <p className="text-xs text-surface-500">
                          {WORK_ORDER_TYPE_LABELS[order.type] ?? order.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-surface-500">
                          {formatDate(order.completedDate ?? order.estimatedEndDate)}
                        </span>
                        <StatusBadge type="workOrder" status={order.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Repuestos utilizados: items de inventario consumidos en OTs de la aeronave */}
          <Card>
            <CardHeader>
              <CardTitle>Repuestos utilizados</CardTitle>
              <Package size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {isLoadingInventoryUsage ? (
                <div className="flex h-20 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : !inventoryUsage || inventoryUsage.length === 0 ? (
                <p className="text-sm text-surface-400 italic">
                  Sin repuestos registrados para esta aeronave
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-100 text-left text-xs font-semibold uppercase tracking-wide text-surface-400 dark:border-surface-700">
                        <th className="pb-2 pr-3">N° parte</th>
                        <th className="pb-2 pr-3">Descripción</th>
                        <th className="pb-2 pr-3">Cantidad</th>
                        <th className="pb-2 pr-3">Fecha</th>
                        <th className="pb-2">OT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                      {inventoryUsage.map((item, index) => (
                        <tr key={`${item.partNumber}-${item.workOrderNumber}-${index}`}>
                          <td className="py-2 pr-3 font-mono text-surface-900 dark:text-white">
                            {item.partNumber}
                          </td>
                          <td className="py-2 pr-3 text-surface-700 dark:text-surface-300">
                            {item.itemDescription}
                          </td>
                          <td className="py-2 pr-3 text-surface-700 dark:text-surface-300">
                            {item.quantity}
                          </td>
                          <td className="py-2 pr-3 text-surface-500">
                            {formatDate(item.movementDate)}
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: item.workOrderId })
                                )
                              }
                              className="font-semibold text-aviation-600 hover:underline"
                            >
                              {item.workOrderNumber}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Vencimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Vencimientos</CardTitle>
              <Calendar size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              <dl className="space-y-3 text-sm">
                {aircraft.lastInspectionDate && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                      Última inspección
                    </dt>
                    <dd className="mt-0.5 text-surface-700 dark:text-surface-300">
                      {formatDate(aircraft.lastInspectionDate)}
                    </dd>
                  </div>
                )}
                {aircraft.nextInspectionDue && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                      Próxima inspección
                    </dt>
                    <dd
                      className={`mt-0.5 font-medium ${
                        daysToInspection !== null && daysToInspection <= 30
                          ? 'text-amber-600'
                          : 'text-surface-900 dark:text-white'
                      }`}
                    >
                      {formatDate(aircraft.nextInspectionDue)}
                      {daysToInspection !== null && (
                        <span className="ml-1 text-xs font-normal text-surface-500">
                          ({daysToInspection > 0 ? `en ${daysToInspection} días` : 'VENCIDA'})
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                    Cert. aeronavegabilidad
                  </dt>
                  <dd
                    className={`mt-0.5 font-medium ${
                      daysToCertExpiry <= 30
                        ? 'text-red-600'
                        : 'text-surface-900 dark:text-white'
                    }`}
                  >
                    {formatDate(aircraft.certificateExpiry)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Documentación */}
          <Card>
            <CardHeader>
              <CardTitle>Documentación</CardTitle>
              <FileText size={16} className="text-surface-400" />
            </CardHeader>
            <CardBody>
              {aircraft.documents.length === 0 ? (
                <p className="text-sm text-surface-400 italic">Sin documentos cargados</p>
              ) : (
                <ul className="space-y-2">
                  {aircraft.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-surface-200 px-3 py-2 text-sm dark:border-surface-700"
                    >
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-surface-500">{doc.type}</p>
                      </div>
                      {doc.isExpired && (
                        <span className="text-xs font-medium text-red-600">Vencido</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setIsDocumentModalOpen(true)}
              >
                Subir documento
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      <AddAircraftDocumentModal
        aircraftId={aircraft.id}
        isOpen={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
      />
    </motion.div>
  );
}
