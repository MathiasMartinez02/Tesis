import type {
  PaginatedResult,
  User,
  UserFilters,
  UserRole,
  CreateUserPayload,
  UpdateUserPayload,
  UserLookup,
  ApiResponse,
} from '@/types';
import apiClient from '@/lib/axios';

function normalizeUser(raw: User & { fullName?: string }): User {
  return {
    ...raw,
    fullName: raw.fullName ?? `${raw.firstName} ${raw.lastName}`,
  };
}

export const usersService = {
  async getAll(
    filters: UserFilters = {},
    page = 1,
    pageSize = 100
  ): Promise<PaginatedResult<User>> {
    const backendFilters = {
      ...filters,
      ...(filters.role && { role: filters.role as UserRole }),
    };

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<User & { fullName?: string }>>>(
      '/users',
      { params: { ...backendFilters, page, pageSize } }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar usuarios');
    return {
      ...data.data,
      data: data.data.data.map(normalizeUser),
    };
  },

  // Trae un usuario puntual por id (usado en SettingsUsersPage para el detalle/edicion)
  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User & { fullName?: string }>>(`/users/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Usuario no encontrado');
    return normalizeUser(data.data);
  },

  // Crea un usuario nuevo (alta desde SettingsUsersPage)
  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User & { fullName?: string }>>('/users', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear usuario');
    return normalizeUser(data.data);
  },

  // Actualiza los datos de perfil/rol de un usuario existente
  async update(id: string, payload: UpdateUserPayload): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/users/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar usuario');
  },

  // Activa o desactiva un usuario mediante PATCH /users/{id}/status
  async setActive(id: string, isActive: boolean): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/users/${id}/status`, { isActive });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar estado');
  },

  // Usuarios activos de los roles indicados, para combos de asignacion
  async lookup(roles: UserRole[] = []): Promise<UserLookup[]> {
    const { data } = await apiClient.get<ApiResponse<UserLookup[]>>('/users/lookup', {
      params: { role: roles },
      paramsSerializer: { indexes: null },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar usuarios');
    return data.data;
  },

  // Contraseña nueva asignada por el gerente
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/users/${id}/password`, { newPassword });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al asignar la contraseña');
  },
};
