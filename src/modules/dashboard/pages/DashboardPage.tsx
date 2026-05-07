import { ClipboardList, CheckSquare, Plane, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { KPICard } from '@/shared/components/KPICard/KPICard';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { WorkOrdersChart } from '../components/WorkOrdersChart';
import { AircraftStatusChart } from '../components/AircraftStatusChart';
import { UpcomingExpiries } from '../components/UpcomingExpiries';
import { ActivityFeed } from '../components/ActivityFeed';
import { useDashboard } from '../hooks/useDashboard';
import { useAuthStore, selectUser } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function DashboardPage(): JSX.Element {
  const { data, isLoading, isError, refetch } = useDashboard();
  const user = useAuthStore(selectUser);

  if (isError) {
    return (
      <ErrorState
        title="Error al cargar el dashboard"
        description="No se pudieron obtener los datos. Verificá la conexión y reintentá."
        onRetry={() => void refetch()}
      />
    );
  }

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Buenos días' : now.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title={`${greeting}, ${user?.firstName ?? 'Usuario'}`}
          description={`${formatDate(new Date())} — Panel de control operacional`}
        />
      </motion.div>

      {/* KPIs */}
      <motion.section variants={itemVariants} aria-label="Indicadores clave">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Órdenes Activas"
            value={data?.kpis.activeWorkOrders ?? 0}
            delta={data?.kpis.activeWorkOrdersDelta}
            icon={ClipboardList}
            iconColor="text-aviation-600"
            iconBg="bg-aviation-50"
            trendPositive={false}
            isLoading={isLoading}
          />
          <KPICard
            title="Inspecciones Pendientes"
            value={data?.kpis.pendingInspections ?? 0}
            delta={data?.kpis.pendingInspectionsDelta}
            icon={CheckSquare}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            trendPositive={false}
            isLoading={isLoading}
          />
          <KPICard
            title="Completadas este mes"
            value={data?.kpis.completedThisMonth ?? 0}
            delta={data?.kpis.completedThisMonthDelta}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            trendPositive={true}
            isLoading={isLoading}
          />
          <KPICard
            title="Aeronaves en Taller"
            value={data?.kpis.aircraftInMaintenance ?? 0}
            icon={Plane}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            description="Actualmente en mantenimiento"
            isLoading={isLoading}
          />
        </div>
      </motion.section>

      {/* Alerta de vencidos */}
      {data && data.kpis.overdueItems > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/10">
            <AlertTriangle size={18} className="shrink-0 text-red-600" aria-hidden />
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              Hay <strong>{data.kpis.overdueItems}</strong> {data.kpis.overdueItems === 1 ? 'ítem vencido que requiere' : 'ítems vencidos que requieren'} atención inmediata
            </p>
          </div>
        </motion.div>
      )}

      {/* Gráficos principales */}
      <motion.section variants={itemVariants} aria-label="Gráficos">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {data ? (
              <WorkOrdersChart data={data.workOrderChart} />
            ) : (
              <div className="h-80 animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800" />
            )}
          </div>
          <div>
            {data ? (
              <AircraftStatusChart data={data.aircraftByStatus} />
            ) : (
              <div className="h-80 animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800" />
            )}
          </div>
        </div>
      </motion.section>

      {/* Vencimientos + Actividad */}
      <motion.section variants={itemVariants} aria-label="Vencimientos y actividad">
        <div className="grid gap-4 lg:grid-cols-2">
          {data ? (
            <UpcomingExpiries expiries={data.upcomingExpiries} />
          ) : (
            <div className="h-72 animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800" />
          )}
          {data ? (
            <ActivityFeed activities={data.recentActivity} />
          ) : (
            <div className="h-72 animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800" />
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
