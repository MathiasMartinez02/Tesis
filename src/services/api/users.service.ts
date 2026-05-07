import type {
  User,
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const usersService = {
  async getAll(
    filters: UserFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<User>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<User>>>('/users', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar usuarios');
    return data.data;
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Usuario no encontrado');
    return data.data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>('/users', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear usuario');
    return data.data;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/users/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar usuario');
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/users/${id}/status`, { isActive });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al cambiar estado del usuario');
  },
};
