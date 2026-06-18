import type { PaginatedResult, User, UserFilters, UserRole, ApiResponse } from '@/types';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

function normalizeUser(raw: User & { fullName?: string }): User {
  return {
    ...raw,
    fullName: raw.fullName ?? `${raw.firstName} ${raw.lastName}`,
  };
}

const MOCK_USERS: User[] = [
  { id: 'usr-001', email: 'admin@sigma.aero', firstName: 'Carlos', lastName: 'Rodríguez', fullName: 'Carlos Rodríguez', role: 'Gerente', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-002', email: 'inspector@sigma.aero', firstName: 'María', lastName: 'González', fullName: 'María González', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-003', email: 'mecanico1@sigma.aero', firstName: 'Jorge', lastName: 'Méndez', fullName: 'Jorge Méndez', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-004', email: 'jefetaller@sigma.aero', firstName: 'Roberto', lastName: 'Vásquez', fullName: 'Roberto Vásquez', role: 'JefeTaller', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-005', email: 'inspector2@sigma.aero', firstName: 'Alejandro', lastName: 'Soria', fullName: 'Alejandro Soria', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-006', email: 'inspector3@sigma.aero', firstName: 'Patricia', lastName: 'Méndez', fullName: 'Patricia Méndez', role: 'Inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-007', email: 'mecanico2@sigma.aero', firstName: 'Luis', lastName: 'Fernández', fullName: 'Luis Fernández', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-008', email: 'mecanico3@sigma.aero', firstName: 'Pablo', lastName: 'Suárez', fullName: 'Pablo Suárez', role: 'Mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
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
};
