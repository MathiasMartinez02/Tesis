import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { useWorkOrders } from '@/modules/workOrders/hooks/useWorkOrders';
import { ROUTES, buildRoute } from '@/constants';
import { clickableProps } from '@/lib/a11y';
import { formatDate, formatFlightHours } from '@/lib/utils';
import type { WorkOrder } from '@/types';

const ACTIVE_LIMIT = 50;

// Vista del taller: OT en proceso, en inspeccion y pendientes con su avance
export function WorkshopPage(): JSX.Element {
  const navigate = useNavigate();
  const inProgress = useWorkOrders({ status: 'EnProceso' }, 1, ACTIVE_LIMIT);
  const inInspection = useWorkOrders({ status: 'EnInspeccion' }, 1, ACTIVE_LIMIT);
  const pending = useWorkOrders({ status: 'Pendiente' }, 1, ACTIVE_LIMIT);
  const queries = [inProgress, inInspection, pending];

  if (queries.some((q) => q.isError)) {
    return <ErrorState title="Error al cargar el taller" onRetry={() => queries.forEach((q) => void q.refetch())} />;
  }

  const isLoading = queries.some((q) => q.isLoading);
  const activeOrders: WorkOrder[] = queries.flatMap((q) => q.data?.data ?? []);
  const stats = [
    { label: 'En proceso', count: inProgress.data?.total ?? 0, color: 'text-blue-600' },
    { label: 'En inspección', count: inInspection.data?.total ?? 0, color: 'text-purple-600' },
    { label: 'Pendientes', count: pending.data?.total ?? 0, color: 'text-amber-600' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <PageHeader title="Taller" description="Vista operacional del taller de mantenimiento" />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{isLoading ? '–' : stat.count}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-surface-500" />
            <CardTitle>Órdenes Activas en Taller</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : activeOrders.length === 0 ? (
            <p className="py-4 text-center text-sm italic text-surface-400">No hay órdenes activas en el taller</p>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const progress = order.taskCount > 0 ? Math.round((order.completedTaskCount / order.taskCount) * 100) : 0;

                return (
                  <div
                    key={order.id}
                    {...clickableProps(() => navigate(buildRoute(ROUTES.WORK_ORDER_DETAIL, { id: order.id })))}
                    aria-label={`Orden ${order.number}`}
                    className="cursor-pointer rounded-lg border border-surface-100 p-4 outline-none transition-colors hover:bg-surface-50 focus-visible:ring-2 focus-visible:ring-aviation-500 dark:border-surface-700 dark:hover:bg-surface-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-aviation-600">{order.number}</span>
                          <StatusBadge type="workOrder" status={order.status} />
                          <StatusBadge type="priority" status={order.priority} showDot={false} />
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-surface-900 dark:text-white">
                          {order.aircraftRegistration} — {order.aircraftModel}
                        </p>
                        <p className="text-xs text-surface-500">{order.clientName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-surface-500">Fecha límite</p>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{formatDate(order.estimatedEndDate)}</p>
                      </div>
                    </div>

                    {order.taskCount > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-surface-500">
                          <span>
                            Tareas: {order.completedTaskCount}/{order.taskCount}
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                          <div className="h-full rounded-full bg-aviation-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-surface-500">
                      Horas aeronave al inicio: {formatFlightHours(order.aircraftHoursAtStart)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
