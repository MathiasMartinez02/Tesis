import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const;

const TOAST_STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-900 dark:bg-red-900/20 dark:border-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800',
} as const;

const ICON_STYLES = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
} as const;

export function ToastContainer(): JSX.Element {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              role="alert"
              className={cn(
                'flex w-80 items-start gap-3 rounded-xl border p-4 shadow-dropdown',
                TOAST_STYLES[toast.type]
              )}
            >
              <Icon size={18} className={cn('mt-0.5 shrink-0', ICON_STYLES[toast.type])} aria-hidden />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-sm opacity-80">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
