import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'No se pudieron cargar los datos. Por favor, intentá nuevamente.',
  onRetry,
}: ErrorStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center dark:border-red-900/30 dark:bg-red-900/10">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertTriangle size={24} className="text-red-500" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-surface-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-surface-500 dark:text-surface-400">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5"
          leftIcon={<RefreshCw size={14} />}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
