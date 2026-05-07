import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
};

export function Spinner({ size = 'md', className, label = 'Cargando...' }: SpinnerProps): JSX.Element {
  return (
    <Loader2
      size={sizeMap[size]}
      className={cn('animate-spin text-aviation-500', className)}
      aria-label={label}
      role="status"
    />
  );
}
