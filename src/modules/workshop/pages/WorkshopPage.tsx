import { Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { StatusBadge } from '@/shared/components/StatusBadge/StatusBadge';
import { useWorkOrders } from '@/modules/workOrders/hooks/useWorkOrders';
import { formatDate, formatFlightHours } from '@/lib/utils';

export function WorkshopPage(): JSX.Element {
  const { data: result } = useWorkOrders({ status: 'EnProceso' });
  const { data: pendingResult } = useWorkOrders({ status: 'Pendiente' });

  const inProgressOrders = result?.data ?? [];
  const pendingOrders = pendingResult?.data ?? [];
  const activeOrders = [...inProgressOrders, ...pendingOrders];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <PageHeader
        title="Taller"
        description="Vista operacional del taller de mantenimiento"
      />

      {/* Resumen de carga */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'En proceso', count: inProgressOrders.length, color: 'text-blue-600' },
          { label: 'Pendientes', count: pendingOrders.length, color: 'text-amber-600' },
          { label: 'Total activas', count: activeOrders.length, color: 'text-emerald-600' },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              {stat.label}
            </p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.count}</p>
          </Card>
        ))}
      </div>

      {/* Órdenes activas en taller */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-surface-500" />
            <CardTitle>Órdenes Activas en Taller</CardTitle>
          </div>
        </CardHeader>
        <CardBody>
          {activeOrders.length === 0 ? (
            <p className="text-sm text-surface-400 italic text-center py-4">
              No hay órdenes activas en el taller
            </p>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const progress = order.taskCount > 0
                  ? Math.round((order.completedTaskCount / order.taskCount) * 100)
                  : 0;

                return (
                  <div
                    key={order.id}
                    className="rounded-lg border border-surface-100 p-4 dark:border-surface-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-aviation-600">
                            {order.number}
                          </span>
                          <StatusBadge type="workOrder" status={order.status} />
                          <StatusBadge type="priority" status={order.priority} showDot={false} />
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-surface-900 dark:text-white">
                          {order.aircraftRegistration} — {order.aircraftModel}
                        </p>
                        <p className="text-xs text-surface-500">{order.clientName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-surface-500">Fecha límite</p>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {formatDate(order.estimatedEndDate)}
                        </p>
                      </div>
                    </div>

                    {/* Progreso de tareas */}
                    {order.taskCount > 0 && (
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-surface-500">
                          <span>Tareas: {order.completedTaskCount}/{order.taskCount}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-700">
                          <div
                            className="h-full rounded-full bg-aviation-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
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
