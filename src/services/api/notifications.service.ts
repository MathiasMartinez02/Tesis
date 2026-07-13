import type {
  Notification,
  NotificationFilters,
  UnreadCountResponse,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const notificationsService = {
  // Obtiene el listado paginado de notificaciones del usuario autenticado
  async getAll(filters: NotificationFilters = {}): Promise<PaginatedResult<Notification>> {
    const { page = 1, pageSize = 10, unreadOnly } = filters;
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Notification>>>(
      '/notifications',
      { params: { page, pageSize, unreadOnly } }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar notificaciones');
    return data.data;
  },

  // Obtiene la cantidad de notificaciones sin leer para el badge de la campana
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<ApiResponse<UnreadCountResponse>>(
      '/notifications/unread-count'
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al obtener el contador de notificaciones');
    return data.data;
  },

  // Marca una notificacion puntual como leida
  async markAsRead(id: string): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al marcar la notificación como leída');
  },

  // Marca todas las notificaciones del usuario como leidas
  async markAllAsRead(): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>('/notifications/read-all');
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al marcar todas las notificaciones como leídas');
  },
};
