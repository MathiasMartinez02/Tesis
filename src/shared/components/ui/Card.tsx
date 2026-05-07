import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  className,
  hover = false,
  padding = 'md',
  children,
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-xl border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-800',
        hover && 'cursor-pointer transition-shadow hover:shadow-card-hover',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-5',
        padding === 'lg' && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-surface-100 pb-4 dark:border-surface-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps): JSX.Element {
  return (
    <h3
      className={cn('text-base font-semibold text-surface-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps): JSX.Element {
  return (
    <div className={cn('pt-4', className)} {...props}>
      {children}
    </div>
  );
}
