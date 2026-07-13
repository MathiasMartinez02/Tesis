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
import { MOCK_INVENTORY } from '@/mocks/inventory.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';
import { isAxiosError } from 'axios';

// MODIFICADO: agrega el switch ENV.ENABLE_MOCK_API para alternar entre datos mockeados y la API real, igual que aircraft.service.ts y workOrders.service.ts
// ANTERIOR: siempre llamaba a la API real, sin soporte de modo mock
export const inventoryService = {
  async getAll(
    filters: InventoryFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<InventoryItem>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const filtered = MOCK_INVENTORY.filter((i) => {
        if (filters.category && i.category !== filters.category) return false;
        if (filters.status && i.status !== filters.status) return false;
        if (filters.lowStock && i.status !== 'BajoStock' && i.status !== 'SinStock') return false;
        if (filters.expiringSoon && !i.expiryDate) return false;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            i.partNumber.toLowerCase().includes(search) ||
            i.description.toLowerCase().includes(search) ||
            i.manufacturer.toLowerCase().includes(search)
          );
        }
        return true;
      });
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<InventoryItem>>>('/inventory', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar inventario');
    return data.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const item = MOCK_INVENTORY.find((i) => i.id === id);
      if (!item) throw new Error('Ítem no encontrado');
      return item;
    }

    const { data } = await apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Ítem no encontrado');
    return data.data;
  },

  async getMovements(
    id: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<InventoryMovement>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<InventoryMovement>>>(
      `/inventory/${id}/movements`,
      { params: { page, pageSize } }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar movimientos');
    return data.data;
  },

  async create(payload: CreateInventoryItemPayload): Promise<InventoryItem> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      const newItem: InventoryItem = {
        ...payload,
        id: `inv-${Date.now()}`,
        currentStock: 0,
        status: 'Disponible',
        certificationRequired: payload.certificationRequired ?? false,
        createdAt: new Date().toISOString(),
      };
      MOCK_INVENTORY.push(newItem);
      return newItem;
    }

    const { data } = await apiClient.post<ApiResponse<InventoryItem>>('/inventory', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear ítem');
    return data.data;
  },

  // MODIFICADO: el tipo del payload ahora referencia UpdateInventoryItemPayload (@/types) en vez de un objeto inline, para poder reutilizarlo desde useUpdateInventoryItem/InventoryItemEditPage
  // ANTERIOR: el payload se tipaba con un objeto inline definido en el propio metodo
  async update(id: string, payload: UpdateInventoryItemPayload): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const item = MOCK_INVENTORY.find((i) => i.id === id);
      if (!item) throw new Error('Ítem no encontrado');
      Object.assign(item, payload);
      return;
    }

    const { data } = await apiClient.put<ApiResponse<null>>(`/inventory/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar ítem');
  },

  // Elimina un item de inventario; el backend rechaza la baja con un error de negocio (400) si currentStock > 0,
  // por lo que se captura el AxiosError y se relanza con el mensaje real que viene en el body en vez del genérico de axios
  async delete(id: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const item = MOCK_INVENTORY.find((i) => i.id === id);
      if (!item) throw new Error('Ítem no encontrado');
      if (item.currentStock > 0) {
        throw new Error('No se puede eliminar un ítem con stock disponible. Retire el stock antes de eliminarlo.');
      }
      const index = MOCK_INVENTORY.indexOf(item);
      MOCK_INVENTORY.splice(index, 1);
      return;
    }

    try {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/inventory/${id}`);
      if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al eliminar ítem');
    } catch (err) {
      if (isAxiosError<ApiResponse<null>>(err) && err.response?.data) {
        const backendMessage = err.response.data.errors?.[0] ?? err.response.data.message;
        if (backendMessage) throw new Error(backendMessage);
      }
      throw err;
    }
  },

  async addMovement(
    id: string,
    payload: CreateInventoryMovementPayload
  ): Promise<InventoryMovement> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const item = MOCK_INVENTORY.find((i) => i.id === id);
      if (!item) throw new Error('Ítem no encontrado');
      const previousStock = item.currentStock;
      const delta = payload.type === 'Salida' || payload.type === 'Reserva' ? -payload.quantity : payload.quantity;
      item.currentStock = previousStock + delta;
      item.lastMovementDate = new Date().toISOString();
      return {
        id: `mov-${Date.now()}`,
        type: payload.type,
        quantity: payload.quantity,
        previousStock,
        newStock: item.currentStock,
        workOrderId: payload.workOrderId,
        reason: payload.reason,
        performedById: 'usr-001',
        performedByName: 'Usuario Actual',
        performedAt: new Date().toISOString(),
      };
    }

    const { data } = await apiClient.post<ApiResponse<InventoryMovement>>(
      `/inventory/${id}/movements`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al registrar movimiento');
    return data.data;
  },

  // Aprueba un movimiento de tipo Salida; el backend marca approvedById/approvedByName en la respuesta
  async approveMovement(itemId: string, movementId: string): Promise<InventoryMovement> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      throw new Error('Aprobación de movimientos no soportada en modo mock');
    }

    const { data } = await apiClient.patch<ApiResponse<InventoryMovement>>(
      `/inventory/${itemId}/movements/${movementId}/approve`
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al aprobar movimiento');
    return data.data;
  },
};
