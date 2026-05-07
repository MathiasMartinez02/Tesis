import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps): JSX.Element {
  return (
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-surface-900 dark:text-white lg:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
