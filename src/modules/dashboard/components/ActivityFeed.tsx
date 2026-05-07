import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  PlusCircle,
  Plane,
  Package,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn, formatRelativeTime, getInitials } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardBody } from '@/shared/components/ui/Card';
import type { RecentActivity } from '@/types';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

const ACTIVITY_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  work_order_created: { icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  work_order_completed: { icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  inspection_approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  inspection_rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  aircraft_added: { icon: Plane, color: 'text-aviation-600', bg: 'bg-aviation-100' },
  part_requested: { icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
};

const DEFAULT_ACTIVITY_CONFIG = { icon: Activity, color: 'text-surface-500', bg: 'bg-surface-100' };

export function ActivityFeed({ activities }: ActivityFeedProps): JSX.Element {
  return (
    <Card padding="none">
      <div className="p-5">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardBody>
          <ol className="space-y-4" aria-label="Actividad reciente">
            {activities.map((activity) => {
              const config = ACTIVITY_CONFIG[activity.type] ?? DEFAULT_ACTIVITY_CONFIG;
              const Icon = config.icon;
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  {/* Ícono de actividad */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      config.bg
                    )}
                    aria-hidden
                  >
                    <Icon size={14} className={config.color} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 dark:text-surface-300">
                      {activity.description}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {/* Avatar usuario */}
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-aviation-600 text-2xs font-semibold text-white">
                        {getInitials(activity.userName)}
                      </span>
                      <span className="text-xs text-surface-500">{activity.userName}</span>
                      <span className="text-2xs text-surface-400">•</span>
                      <time
                        dateTime={activity.createdAt}
                        className="text-xs text-surface-400"
                      >
                        {formatRelativeTime(activity.createdAt)}
                      </time>
                    </div>
                    {activity.referenceNumber && (
                      <span className="mt-0.5 text-2xs font-mono text-aviation-600">
                        #{activity.referenceNumber}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardBody>
      </div>
    </Card>
  );
}
