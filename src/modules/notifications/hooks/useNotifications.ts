import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/api/notifications.service';
import type { NotificationFilters } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'] as const;

// Lista las ultimas notificaciones del usuario autenticado, paginadas
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, filters],
    queryFn: () => notificationsService.getAll(filters),
  });
}

// Obtiene el contador de notificaciones sin leer, refrescando cada 60s para el badge
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 60_000,
  });
}

// Marca una notificacion como leida e invalida el listado y el contador
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al marcar notificación como leída', description: err.message });
    },
  });
}

// Marca todas las notificaciones como leidas e invalida el listado y el contador
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      addToast({ type: 'success', title: 'Notificaciones marcadas como leídas' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al marcar todas como leídas', description: err.message });
    },
  });
}
