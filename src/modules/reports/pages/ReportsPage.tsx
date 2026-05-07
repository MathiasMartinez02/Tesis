import { BarChart3, Download, FileText, TrendingUp, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useAircraftStatusReport } from '../hooks/useReports';

const lineData = [
  { mes: 'Jul', horas: 145 },
  { mes: 'Ago', horas: 178 },
  { mes: 'Sep', horas: 132 },
  { mes: 'Oct', horas: 210 },
  { mes: 'Nov', horas: 168 },
  { mes: 'Dic', horas: 95 },
  { mes: 'Ene', horas: 187 },
];

const REPORT_TEMPLATES = [
  { id: 'anac-monthly', title: 'Informe Mensual ANAC', description: 'Reporte de trabajos realizados para presentación a ANAC', icon: FileText },
  { id: 'inspections', title: 'Resumen de Inspecciones', description: 'Listado de inspecciones aprobadas y rechazadas', icon: BarChart3 },
  { id: 'aircraft-status', title: 'Estado de Flota', description: 'Estado actual de todas las aeronaves en el sistema', icon: TrendingUp },
  { id: 'inventory', title: 'Inventario Pañol', description: 'Movimientos y stock actual del pañol', icon: PieChart },
];

const STATUS_COLORS: Record<string, string> = {
  Operativa: '#10b981',
  EnMantenimiento: '#3b82f6',
  EnInspeccion: '#8b5cf6',
  FueraDeServicio: '#ef4444',
};

export function ReportsPage(): JSX.Element {
  const { data: aircraftReport, isLoading: isLoadingAircraft } = useAircraftStatusReport();

  const aircraftChartData = aircraftReport
    ? Object.entries(aircraftReport.byStatus).map(([status, count]) => ({
        name: status,
        value: count,
        color: STATUS_COLORS[status] ?? '#64748b',
      }))
    : [];

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
          {REPORT_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Card hover className="h-full">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aviation-50 mb-3">
                    <Icon size={18} className="text-aviation-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    {template.title}
                  </h3>
                  <p className="mt-1 text-xs text-surface-500">{template.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    leftIcon={<Download size={13} />}
                  >
                    Exportar PDF
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Gráficos analíticos */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Horas trabajadas */}
        <Card padding="none">
          <div className="p-5">
            <CardHeader>
              <CardTitle>Horas de Taller por Mes</CardTitle>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </div>
        </Card>

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
    </motion.div>
  );
}
