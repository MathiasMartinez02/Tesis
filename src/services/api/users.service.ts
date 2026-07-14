import type {
  PaginatedResult,
  User,
  UserFilters,
  UserRole,
  CreateUserPayload,
  UpdateUserPayload,
  ApiResponse,
} from '@/types';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

function normalizeUser(raw: User & { fullName?: string }): User {
  return {
    ...raw,
    fullName: raw.fullName ?? `${raw.firstName} ${raw.lastName}`,
  };
}

// MODIFICADO: se quita el campo `updatedAt` de cada usuario mock, que no existe en el tipo `User` (solo tiene `createdAt`) y generaba 8 errores de TS2353
// ANTERIOR: cada entrada de MOCK_USERS incluia `updatedAt: '2026-01-01T00:00:00'`
const MOCK_USERS: User[] = [
  { id: 'usr-001', email: 'admin@sigma.aero', firstName: 'Carlos', lastName: 'Rodríguez', fullName: 'Carlos Rodríguez', role: 'Gerente', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-002', email: 'inspector@sigma.aero', firstName: 'María', lastName: 'González', fullName: 'María González', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-003', email: 'mecanico1@sigma.aero', firstName: 'Jorge', lastName: 'Méndez', fullName: 'Jorge Méndez', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-004', email: 'jefetaller@sigma.aero', firstName: 'Roberto', lastName: 'Vásquez', fullName: 'Roberto Vásquez', role: 'JefeTaller', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-005', email: 'inspector2@sigma.aero', firstName: 'Alejandro', lastName: 'Soria', fullName: 'Alejandro Soria', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-006', email: 'inspector3@sigma.aero', firstName: 'Patricia', lastName: 'Méndez', fullName: 'Patricia Méndez', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-007', email: 'mecanico2@sigma.aero', firstName: 'Luis', lastName: 'Fernández', fullName: 'Luis Fernández', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'usr-008', email: 'mecanico3@sigma.aero', firstName: 'Pablo', lastName: 'Suárez', fullName: 'Pablo Suárez', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00' },
];

export const usersService = {
  async getAll(
    filters: UserFilters = {},
    page = 1,
    pageSize = 100
  ): Promise<PaginatedResult<User>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      const filtered = MOCK_USERS.filter((u) => {
        if (filters.role && u.role !== filters.role) return false;
        if (filters.isActive !== undefined && u.isActive !== filters.isActive) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
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
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) throw new Error('Usuario no encontrado');
      return normalizeUser(user);
    }

    const { data } = await apiClient.get<ApiResponse<User & { fullName?: string }>>(`/users/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Usuario no encontrado');
    return normalizeUser(data.data);
  },

  // Crea un usuario nuevo (alta desde SettingsUsersPage)
  async create(payload: CreateUserPayload): Promise<User> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 500));
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName: `${payload.firstName} ${payload.lastName}`,
        role: payload.role,
        licenseNumber: payload.licenseNumber,
        phone: payload.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      MOCK_USERS.push(newUser);
      return newUser;
    }

    const { data } = await apiClient.post<ApiResponse<User & { fullName?: string }>>('/users', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear usuario');
    return normalizeUser(data.data);
  },

  // Actualiza los datos de perfil/rol de un usuario existente
  async update(id: string, payload: UpdateUserPayload): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) throw new Error('Usuario no encontrado');
      Object.assign(user, payload, { fullName: `${payload.firstName} ${payload.lastName}` });
      return;
    }

    const { data } = await apiClient.put<ApiResponse<null>>(`/users/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar usuario');
  },

  // Activa o desactiva un usuario mediante PATCH /users/{id}/status
  async setActive(id: string, isActive: boolean): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) throw new Error('Usuario no encontrado');
      user.isActive = isActive;
      return;
    }

    const { data } = await apiClient.patch<ApiResponse<null>>(`/users/${id}/status`, { isActive });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar estado');
  },
};
