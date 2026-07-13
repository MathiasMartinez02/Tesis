import { AlertTriangle, FileWarning, Package, PackageX, ClipboardCheck, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/modules/notifications/hooks/useNotifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Icono y color asociado a cada tipo de notificacion */
const NOTIFICATION_ICON_MAP: Record<NotificationType, { icon: typeof AlertTriangle; className: string }> = {
  InspeccionProxima: { icon: ClipboardCheck, className: 'text-aviation-600 bg-aviation-50 dark:bg-aviation-900/20' },
  CertificadoPorVencer: { icon: FileWarning, className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  DocumentoPorVencer: { icon: FileWarning, className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  StockBajo: { icon: Package, className: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  StockSobre: { icon: Package, className: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  StockVencido: { icon: PackageX, className: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
};

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

// Renderiza una notificacion individual, marcandola como leida al hacer click
function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const { icon: Icon, className } = NOTIFICATION_ICON_MAP[notification.type] ?? {
    icon: AlertTriangle,
    className: 'text-surface-600 bg-surface-100',
  };

  return (
    <button
      onClick={() => !notification.isRead && onRead(notification.id)}
      className={cn(
        'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-50 dark:hover:bg-surface-700',
        !notification.isRead && 'bg-aviation-50/60 dark:bg-aviation-900/10'
      )}
    >
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', className)}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-surface-900 dark:text-white">
          {notification.title}
          {!notification.isRead && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-aviation-600" aria-hidden />
          )}
        </p>
        <p className="line-clamp-2 text-xs text-surface-500">{notification.message}</p>
        <p className="mt-0.5 text-2xs text-surface-400">{formatRelativeTime(notification.createdAt)}</p>
      </div>
    </button>
  );
}

// Panel desplegable con las ultimas notificaciones y accion para marcar todas como leidas
export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { data, isLoading } = useNotifications({ pageSize: 10 });
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-1 w-80 rounded-xl border border-surface-200 bg-white py-1.5 shadow-dropdown dark:border-surface-700 dark:bg-surface-800"
          >
            <div className="flex items-center justify-between border-b border-surface-100 px-3 py-2 dark:border-surface-700">
              <p className="text-sm font-medium text-surface-900 dark:text-white">Notificaciones</p>
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll || notifications.every((n) => n.isRead)}
                className="flex items-center gap-1 text-xs text-aviation-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={12} />
                Marcar todas como leídas
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading && (
                <p className="px-3 py-4 text-center text-sm text-surface-500">Cargando...</p>
              )}
              {!isLoading && notifications.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-surface-500">Sin notificaciones</p>
              )}
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
