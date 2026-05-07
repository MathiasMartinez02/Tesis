import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '../ui/Card';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number; // Porcentaje de cambio
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPositive?: boolean; // true = up es bueno, false = up es malo
  isLoading?: boolean;
  className?: string;
}

export function KPICard({
  title,
  value,
  delta,
  icon: Icon,
  iconColor = 'text-aviation-600',
  iconBg = 'bg-aviation-50',
  description,
  trendPositive = true,
  isLoading = false,
  className,
}: KPICardProps): JSX.Element {
  const getTrendColor = (): string => {
    if (delta === undefined || delta === 0) return 'text-surface-500';
    const isGood = trendPositive ? delta > 0 : delta < 0;
    return isGood ? 'text-emerald-600' : 'text-red-600';
  };

  const TrendIcon =
    delta === undefined || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('hover:shadow-card-hover transition-shadow', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-surface-200 dark:bg-surface-700" />
            ) : (
              <p className="mt-1 text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
                {value}
              </p>
            )}

            {delta !== undefined && !isLoading && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                <TrendIcon size={13} aria-hidden />
                <span>
                  {Math.abs(delta)}% vs mes anterior
                </span>
              </div>
            )}

            {description && (
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">{description}</p>
            )}
          </div>

          {/* Icono */}
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
            <Icon size={22} className={iconColor} aria-hidden />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
