import { cn, formatDateTime, getInitials } from '@/lib/utils';
import type { WorkOrderTimeline } from '@/types';

interface TimelineProps {
  events: WorkOrderTimeline[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps): JSX.Element {
  return (
    <ol className={cn('relative space-y-0', className)} aria-label="Timeline de eventos">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Línea vertical */}
          {index < events.length - 1 && (
            <div className="absolute left-4 top-8 bottom-0 w-px bg-surface-200 dark:bg-surface-700" aria-hidden />
          )}

          {/* Avatar */}
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aviation-100 ring-4 ring-white dark:ring-surface-800">
            <span className="text-xs font-semibold text-aviation-700">
              {getInitials(event.userName)}
            </span>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-surface-900 dark:text-white">
                {event.userName}
              </span>
              <span className="text-2xs text-surface-500">{event.userRole}</span>
            </div>
            <p className="mt-0.5 text-sm text-surface-700 dark:text-surface-300">{event.event}</p>
            {event.description && (
              <p className="mt-0.5 text-xs text-surface-500">{event.description}</p>
            )}
            <time
              dateTime={event.createdAt}
              className="mt-1 block text-xs text-surface-400"
            >
              {formatDateTime(event.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
