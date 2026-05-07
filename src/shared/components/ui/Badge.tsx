import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-surface-200 bg-surface-100 text-surface-700',
        primary: 'border-aviation-200 bg-aviation-50 text-aviation-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        error: 'border-red-200 bg-red-50 text-red-700',
        purple: 'border-purple-200 bg-purple-50 text-purple-700',
        orange: 'border-orange-200 bg-orange-50 text-orange-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps): JSX.Element {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'primary' && 'bg-aviation-500',
            variant === 'purple' && 'bg-purple-500',
            variant === 'orange' && 'bg-orange-500',
            (!variant || variant === 'default') && 'bg-surface-400'
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
