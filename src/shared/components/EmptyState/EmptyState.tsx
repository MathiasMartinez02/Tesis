import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-200 bg-surface-50 px-6 py-16 text-center dark:border-surface-700 dark:bg-surface-800/30',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
        <Icon size={24} className="text-surface-400" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-surface-800 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-surface-500 dark:text-surface-400">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-5" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
