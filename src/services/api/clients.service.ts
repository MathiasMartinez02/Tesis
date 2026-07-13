import type {
  Client,
  ClientDetail,
  ClientFilters,
  CreateClientPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import { MOCK_CLIENTS } from '@/mocks/clients.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

// MODIFICADO: agrega el switch ENV.ENABLE_MOCK_API para alternar entre datos mockeados y la API real, igual que aircraft.service.ts y workOrders.service.ts
// ANTERIOR: siempre llamaba a la API real, sin soporte de modo mock
export const clientsService = {
  async getAll(
    filters: ClientFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Client>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const filtered = MOCK_CLIENTS.filter((c) => {
        if (filters.isActive !== undefined && c.isActive !== filters.isActive) return false;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            c.name.toLowerCase().includes(search) ||
            c.businessName.toLowerCase().includes(search) ||
            c.taxId.toLowerCase().includes(search)
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

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Client>>>('/clients', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar clientes');
    return data.data;
  },

  async getById(id: string): Promise<ClientDetail> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const client = MOCK_CLIENTS.find((c) => c.id === id);
      if (!client) throw new Error('Cliente no encontrado');
      return { ...client, aircraft: [], recentWorkOrders: [] };
    }

    const { data } = await apiClient.get<ApiResponse<ClientDetail>>(`/clients/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Cliente no encontrado');
    return data.data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      const newClient: Client = {
        ...payload,
        id: `cli-${Date.now()}`,
        aircraftCount: 0,
        totalWorkOrders: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      MOCK_CLIENTS.push(newClient);
      return newClient;
    }

    const { data } = await apiClient.post<ApiResponse<Client>>('/clients', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear cliente');
    return data.data;
  },

  async update(id: string, payload: CreateClientPayload): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const client = MOCK_CLIENTS.find((c) => c.id === id);
      if (!client) throw new Error('Cliente no encontrado');
      Object.assign(client, payload);
      return;
    }

    const { data } = await apiClient.put<ApiResponse<null>>(`/clients/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar cliente');
  },
};
