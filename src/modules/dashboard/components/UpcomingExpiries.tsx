import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import type { UpcomingExpiry } from '@/types';

interface UpcomingExpiriesProps {
  expiries: UpcomingExpiry[];
}

const PRIORITY_STYLES = {
  critical: {
    row: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/5',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    daysLabel: 'text-red-600 font-semibold',
  },
  warning: {
    row: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/5',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    daysLabel: 'text-amber-600 font-semibold',
  },
  normal: {
    row: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/5',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    daysLabel: 'text-surface-600',
  },
} as const;

const TYPE_LABELS = {
  inspeccion: 'Inspección',
  certificado: 'Certificado',
  componente: 'Componente',
  licencia: 'Licencia',
} as const;

function getDaysLabel(days: number): string {
  if (days < 0) return 'Vencido';
  if (days === 0) return 'Hoy';
  if (days === 1) return '1 día';
  return `${days} días`;
}

export function UpcomingExpiries({ expiries }: UpcomingExpiriesProps): JSX.Element {
  return (
    <Card padding="none">
      <div className="p-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" aria-hidden />
            <CardTitle>Próximos Vencimientos</CardTitle>
          </div>
          <button className="flex items-center gap-1 text-xs font-medium text-aviation-600 hover:text-aviation-700">
            Ver todos <ChevronRight size={13} />
          </button>
        </CardHeader>

        <CardBody>
          <div className="space-y-2">
            {expiries.map((item) => {
              const styles = PRIORITY_STYLES[item.priority];
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-r-lg border-l-2 px-3 py-2.5 transition-colors hover:opacity-90',
                    styles.row
                  )}
                >
                  <Clock size={14} className={cn('shrink-0', styles.icon)} aria-hidden />

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-surface-900 dark:text-white">
                      {item.description}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-2xs font-medium',
                          styles.badge
                        )}
                      >
                        {TYPE_LABELS[item.type]}
                      </span>
                      <span className="text-2xs text-surface-500">
                        {formatDate(item.dueDate)}
                      </span>
                    </div>
                  </div>

                  <span className={cn('shrink-0 text-xs', styles.daysLabel)}>
                    {getDaysLabel(item.daysUntilDue)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
