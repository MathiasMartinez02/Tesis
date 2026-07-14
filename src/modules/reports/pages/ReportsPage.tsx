import { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, PieChart, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Modal } from '@/shared/components/Modal/Modal';
import {
  useAircraftStatusReport,
  useInventoryReport,
  useWorkOrdersReport,
  useInspectionsReport,
  useMonthlyWorkshopHours,
} from '../hooks/useReports';
import { formatCurrency, formatDate, downloadCsv } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  Operativa: '#10b981',
  EnMantenimiento: '#3b82f6',
  EnInspeccion: '#8b5cf6',
  FueraDeServicio: '#ef4444',
};

// Descarga el detalle del reporte de OT (usado en el reporte "Informe Mensual ANAC") como CSV del lado del cliente
function exportWorkOrdersReportToCsv(workOrders: { number: string; type: string; status: string; aircraftRegistration: string; clientName: string; estimatedHours: number; actualHours: number; createdAt: string }[]): void {
  const headers = ['N° OT', 'Tipo', 'Estado', 'Aeronave', 'Cliente', 'Horas estimadas', 'Horas reales', 'Fecha de creación'];
  const rows = workOrders.map((w) => [
    w.number,
    w.type,
    w.status,
    w.aircraftRegistration,
    w.clientName,
    w.estimatedHours,
    w.actualHours,
    formatDate(w.createdAt),
  ]);
  downloadCsv(`informe-ot-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

// Descarga el detalle del reporte de inspecciones como CSV del lado del cliente
function exportInspectionsReportToCsv(inspections: { workOrderNumber: string; type: string; status: string; aircraftRegistration: string; inspectorName?: string; scheduledDate: string; completedAt?: string }[]): void {
  const headers = ['OT', 'Tipo', 'Estado', 'Aeronave', 'Inspector', 'Fecha programada', 'Fecha de finalización'];
  const rows = inspections.map((i) => [
    i.workOrderNumber,
    i.type,
    i.status,
    i.aircraftRegistration,
    i.inspectorName ?? '',
    formatDate(i.scheduledDate),
    i.completedAt ? formatDate(i.completedAt) : '',
  ]);
  downloadCsv(`resumen-inspecciones-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

// Descarga el detalle del reporte de estado de flota como CSV del lado del cliente
function exportAircraftReportToCsv(aircraft: { registration: string; model: string; category: string; status: string; totalFlightHours: number }[]): void {
  const headers = ['Matrícula', 'Modelo', 'Categoría', 'Estado', 'Horas de vuelo'];
  const rows = aircraft.map((a) => [a.registration, a.model, a.category, a.status, a.totalFlightHours]);
  downloadCsv(`estado-de-flota-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

// Descarga el detalle del reporte de inventario como CSV del lado del cliente
function exportInventoryReportToCsv(items: { partNumber: string; description: string; category: string; status: string; currentStock: number; unitCost: number }[]): void {
  const headers = ['N° de parte', 'Descripción', 'Categoría', 'Estado', 'Stock actual', 'Costo unitario'];
  const rows = items.map((i) => [i.partNumber, i.description, i.category, i.status, i.currentStock, i.unitCost]);
  downloadCsv(`inventario-panol-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
}

// MODIFICADO: se conectan las 4 tarjetas de reportes a sus hooks reales (useWorkOrdersReport, useInspectionsReport, useAircraftStatusReport, useInventoryReport),
// cada una abre un modal con datos reales y un botón "Exportar CSV" (en vez de PDF, ver decisión de alcance documentada en PLAN_ANALISIS_FUNCIONAL.md). Se reemplaza
// el gráfico de horas por mes (hardcodeado) por datos reales de useMonthlyWorkshopHours, y se agrega el indicador de cumplimiento normativo.
// ANTERIOR: solo la tarjeta "Inventario Pañol" estaba conectada (a un modal); "Informe Mensual ANAC", "Resumen de Inspecciones" y "Estado de Flota" tenían un botón
// "Exportar PDF" sin onClick; el gráfico de horas usaba un array `lineData` fijo en el código; no existía indicador de cumplimiento normativo.
export function ReportsPage(): JSX.Element {
  const { data: aircraftReport, isLoading: isLoadingAircraft } = useAircraftStatusReport();
  const { data: inventoryReport, isLoading: isLoadingInventoryReport } = useInventoryReport();
  const { data: workOrdersReport, isLoading: isLoadingWorkOrdersReport } = useWorkOrdersReport();
  const { data: inspectionsReport, isLoading: isLoadingInspectionsReport } = useInspectionsReport();
  const { data: monthlyHours, isLoading: isLoadingMonthlyHours } = useMonthlyWorkshopHours();

  const [isInventoryReportOpen, setIsInventoryReportOpen] = useState(false);
  const [isWorkOrdersReportOpen, setIsWorkOrdersReportOpen] = useState(false);
  const [isInspectionsReportOpen, setIsInspectionsReportOpen] = useState(false);
  const [isAircraftReportOpen, setIsAircraftReportOpen] = useState(false);

  const aircraftChartData = aircraftReport
    ? Object.entries(aircraftReport.byStatus).map(([status, count]) => ({
        name: status,
        value: count,
        color: STATUS_COLORS[status] ?? '#64748b',
      }))
    : [];

  const lineData = monthlyHours?.items.map((item) => ({ mes: item.label, horas: item.totalHours })) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Reportes"
        description="Métricas, estadísticas y exportación de datos para auditoría"
      />

      {/* Templates de reportes */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
          Reportes disponibles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
            <Card hover className="h-full cursor-pointer" onClick={() => setIsWorkOrdersReportOpen(true)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50 mb-3">
                <FileText size={18} className="text-aviation-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Informe Mensual ANAC</h3>
              <p className="mt-1 text-xs text-surface-500">Reporte de trabajos realizados para presentación a ANAC</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<FileText size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWorkOrdersReportOpen(true);
                }}
              >
                Ver datos
              </Button>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
            <Card hover className="h-full cursor-pointer" onClick={() => setIsInspectionsReportOpen(true)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50 mb-3">
                <BarChart3 size={18} className="text-aviation-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Resumen de Inspecciones</h3>
              <p className="mt-1 text-xs text-surface-500">Listado de inspecciones aprobadas y rechazadas</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<BarChart3 size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInspectionsReportOpen(true);
                }}
              >
                Ver datos
              </Button>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
            <Card hover className="h-full cursor-pointer" onClick={() => setIsAircraftReportOpen(true)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50 mb-3">
                <TrendingUp size={18} className="text-aviation-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Estado de Flota</h3>
              <p className="mt-1 text-xs text-surface-500">Estado actual de todas las aeronaves en el sistema</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<TrendingUp size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAircraftReportOpen(true);
                }}
              >
                Ver datos
              </Button>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
            <Card hover className="h-full cursor-pointer" onClick={() => setIsInventoryReportOpen(true)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50 mb-3">
                <PieChart size={18} className="text-aviation-600" />
              </div>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Inventario Pañol</h3>
              <p className="mt-1 text-xs text-surface-500">Movimientos y stock actual del pañol</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<PieChart size={13} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInventoryReportOpen(true);
                }}
              >
                Ver datos
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Gráficos analíticos */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Horas trabajadas */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-5">
            <CardHeader>
              <CardTitle>Horas de Taller por Mes</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoadingMonthlyHours ? (
                <div className="flex h-[220px] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} width={35} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(v: number) => [`${v}h`, 'Horas']}
                    />
                    <Line
                      type="monotone"
                      dataKey="horas"
                      stroke="#0f62fe"
                      strokeWidth={2.5}
                      dot={{ fill: '#0f62fe', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </div>
        </Card>

        {/* Cumplimiento normativo */}
        <Card padding="none">
          <div className="p-5">
            <CardHeader>
              <CardTitle>Cumplimiento Normativo</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoadingInspectionsReport ? (
                <div className="flex h-[220px] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
                  <ShieldCheck size={28} className="text-aviation-600" />
                  <p className="text-3xl font-bold text-surface-900 dark:text-white">
                    {inspectionsReport?.compliancePercentage != null
                      ? `${inspectionsReport.compliancePercentage}%`
                      : 'N/D'}
                  </p>
                  <p className="text-xs text-surface-500">
                    Inspecciones realizadas en término
                    {inspectionsReport && inspectionsReport.completedCount > 0
                      ? ` (${inspectionsReport.onTimeCount} de ${inspectionsReport.completedCount})`
                      : ''}
                  </p>
                </div>
              )}
            </CardBody>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Estado de flota */}
        <Card padding="none">
          <div className="p-5">
            <CardHeader>
              <CardTitle>Estado de Flota</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoadingAircraft ? (
                <div className="flex h-[220px] items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={aircraftChartData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(v: number) => [v, 'Aeronaves']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {aircraftChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </div>
        </Card>
      </div>

      {/* Modal: Informe Mensual ANAC (useWorkOrdersReport) */}
      <Modal
        isOpen={isWorkOrdersReportOpen}
        onClose={() => setIsWorkOrdersReportOpen(false)}
        title="Informe Mensual ANAC"
        description="Resumen de órdenes de trabajo de los últimos 3 meses"
      >
        {isLoadingWorkOrdersReport || !workOrdersReport ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Total de OT</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">{workOrdersReport.totalCount}</dd>
              </div>
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Promedio de horas</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">{workOrdersReport.averageHours}h</dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Download size={13} />}
              onClick={() => exportWorkOrdersReportToCsv(workOrdersReport.workOrders)}
              disabled={workOrdersReport.workOrders.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Resumen de Inspecciones (useInspectionsReport) */}
      <Modal
        isOpen={isInspectionsReportOpen}
        onClose={() => setIsInspectionsReportOpen(false)}
        title="Resumen de Inspecciones"
        description="Inspecciones programadas en los últimos 3 meses"
      >
        {isLoadingInspectionsReport || !inspectionsReport ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Total</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">{inspectionsReport.totalCount}</dd>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Aprobadas</dt>
                <dd className="mt-1 text-lg font-bold text-emerald-800">{inspectionsReport.byStatus.Aprobada ?? 0}</dd>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/10">
                <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">Rechazadas</dt>
                <dd className="mt-1 text-lg font-bold text-red-800">{inspectionsReport.byStatus.Rechazada ?? 0}</dd>
              </div>
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Cumplimiento</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">
                  {inspectionsReport.compliancePercentage != null ? `${inspectionsReport.compliancePercentage}%` : 'N/D'}
                </dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Download size={13} />}
              onClick={() => exportInspectionsReportToCsv(inspectionsReport.inspections)}
              disabled={inspectionsReport.inspections.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Estado de Flota (useAircraftStatusReport) */}
      <Modal
        isOpen={isAircraftReportOpen}
        onClose={() => setIsAircraftReportOpen(false)}
        title="Estado de Flota"
        description="Estado actual de todas las aeronaves en el sistema"
      >
        {isLoadingAircraft || !aircraftReport ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries(aircraftReport.byStatus).map(([status, count]) => (
                <div key={status} className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">{status}</dt>
                  <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">{count}</dd>
                </div>
              ))}
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Download size={13} />}
              onClick={() => exportAircraftReportToCsv(aircraftReport.aircraft)}
              disabled={aircraftReport.aircraft.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal: Inventario Pañol (useInventoryReport) */}
      <Modal
        isOpen={isInventoryReportOpen}
        onClose={() => setIsInventoryReportOpen(false)}
        title="Inventario Pañol"
        description="Resumen del stock y valorización actual del pañol"
      >
        {isLoadingInventoryReport || !inventoryReport ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Ítems totales</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">
                  {inventoryReport.items.length}
                </dd>
              </div>
              <div className="rounded-lg border border-surface-100 p-3 dark:border-surface-700">
                <dt className="text-xs font-semibold uppercase tracking-wide text-surface-400">Valor total</dt>
                <dd className="mt-1 text-lg font-bold text-surface-900 dark:text-white">
                  {formatCurrency(inventoryReport.totalValue)}
                </dd>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/10">
                <dt className="text-xs font-semibold uppercase tracking-wide text-amber-700">Stock bajo</dt>
                <dd className="mt-1 text-lg font-bold text-amber-800">{inventoryReport.lowStockCount}</dd>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/10">
                <dt className="text-xs font-semibold uppercase tracking-wide text-red-700">Sin stock</dt>
                <dd className="mt-1 text-lg font-bold text-red-800">{inventoryReport.outOfStockCount}</dd>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">Ítems vencidos</dt>
                <dd className="mt-1 text-lg font-bold text-gray-700 dark:text-gray-300">
                  {inventoryReport.expiredCount}
                </dd>
              </div>
            </dl>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Download size={13} />}
              onClick={() => exportInventoryReportToCsv(inventoryReport.items)}
              disabled={inventoryReport.items.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
