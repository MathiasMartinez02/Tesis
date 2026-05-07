import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WorkOrderChartData } from '@/types';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';

interface WorkOrdersChartProps {
  data: WorkOrderChartData[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}): JSX.Element | null => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-surface-200 bg-white p-3 shadow-dropdown dark:border-surface-700 dark:bg-surface-800">
      <p className="mb-2 text-sm font-semibold text-surface-900 dark:text-white">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-surface-600 dark:text-surface-400">{entry.name}:</span>
          <span className="font-medium text-surface-900 dark:text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function WorkOrdersChart({ data }: WorkOrdersChartProps): JSX.Element {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5">
        <CardHeader>
          <CardTitle>Órdenes de Trabajo por Mes</CardTitle>
          <span className="text-xs text-surface-500">Últimos 7 meses</span>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barSize={10} barGap={2} barCategoryGap="30%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
              <Bar dataKey="completadas" name="Completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="enProceso" name="En Proceso" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pendientes" name="Pendientes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </div>
    </Card>
  );
}
