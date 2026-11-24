import type {
  InventoryItem,
  InventoryMovement,
  InventoryFilters,
  CreateInventoryItemPayload,
  CreateInventoryMovementPayload,
  UpdateInventoryItemPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const inventoryService = {
  async getAll(
    filters: InventoryFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<InventoryItem>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<InventoryItem>>>('/inventory', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar inventario');
    return data.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Ítem no encontrado');
    return data.data;
  },

  async getMovements(
    id: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<InventoryMovement>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<InventoryMovement>>>(
      `/inventory/${id}/movements`,
      { params: { page, pageSize } }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar movimientos');
    return data.data;
  },

  async create(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
    const { data } = await apiClient.post<ApiResponse<InventoryItem>>('/inventory', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear ítem');
    return data.data;
  },

  async update(id: string, payload: UpdateInventoryItemPayload): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/inventory/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar ítem');
  },

  // Baja de item de inventario
  async delete(id: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/inventory/${id}`);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al eliminar ítem');
  },

  async addMovement(
    id: string,
    payload: CreateInventoryMovementPayload
  ): Promise<InventoryMovement> {
    const { data } = await apiClient.post<ApiResponse<InventoryMovement>>(
      `/inventory/${id}/movements`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al registrar movimiento');
    return data.data;
  },

  // Aprobacion de una salida de stock
  async approveMovement(itemId: string, movementId: string): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(
      `/inventory/${itemId}/movements/${movementId}/approve`
    );
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al aprobar movimiento');
  },
};
