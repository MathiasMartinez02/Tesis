import type {
  Client,
  ClientDetail,
  ClientFilters,
  CreateClientPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const clientsService = {
  async getAll(
    filters: ClientFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Client>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Client>>>('/clients', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar clientes');
    return data.data;
  },

  async getById(id: string): Promise<ClientDetail> {
    const { data } = await apiClient.get<ApiResponse<ClientDetail>>(`/clients/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Cliente no encontrado');
    return data.data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await apiClient.post<ApiResponse<Client>>('/clients', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear cliente');
    return data.data;
  },

  async update(id: string, payload: CreateClientPayload): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/clients/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar cliente');
  },
};
