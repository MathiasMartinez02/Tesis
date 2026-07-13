// Tipos de notificacion que puede emitir el backend
export type NotificationType =
  | 'InspeccionProxima'
  | 'CertificadoPorVencer'
  | 'DocumentoPorVencer'
  | 'StockBajo'
  | 'StockSobre'
  | 'StockVencido';

/** NotificationDto — lo que devuelve el listado (GET /notifications) */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationFilters {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

/** Respuesta de GET /notifications/unread-count */
export interface UnreadCountResponse {
  count: number;
}
