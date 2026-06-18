import type { PaginatedResponse, User, UserFilters, UserRole } from '@/types';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

const ROLE_MAP: Record<string, UserRole> = {
  Gerente: 'gerente',
  JefeTaller: 'jefe_taller',
  Inspector: 'inspector',
  OficinaTecnica: 'oficina_tecnica',
  Mecanico: 'mecanico',
  Panol: 'panol',
  Administracion: 'administracion',
};

const ROLE_TO_BACKEND = Object.fromEntries(
  Object.entries(ROLE_MAP).map(([k, v]) => [v, k])
) as Record<UserRole, string>;

function normalizeUser(raw: Record<string, unknown>): User {
  const role = (ROLE_MAP[raw.role as string] ?? (raw.role as string).toLowerCase()) as UserRole;
  return {
    ...(raw as unknown as User),
    role,
    fullName: (raw.fullName as string | undefined) ?? `${raw.firstName as string} ${raw.lastName as string}`,
  };
}

const MOCK_USERS: User[] = [
  { id: 'usr-001', email: 'admin@sigma.aero', firstName: 'Carlos', lastName: 'Rodríguez', fullName: 'Carlos Rodríguez', role: 'gerente', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-002', email: 'inspector@sigma.aero', firstName: 'María', lastName: 'González', fullName: 'María González', role: 'inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-003', email: 'mecanico1@sigma.aero', firstName: 'Jorge', lastName: 'Méndez', fullName: 'Jorge Méndez', role: 'mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-004', email: 'jefetaller@sigma.aero', firstName: 'Roberto', lastName: 'Vásquez', fullName: 'Roberto Vásquez', role: 'jefe_taller', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-005', email: 'inspector2@sigma.aero', firstName: 'Alejandro', lastName: 'Soria', fullName: 'Alejandro Soria', role: 'inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-006', email: 'inspector3@sigma.aero', firstName: 'Patricia', lastName: 'Méndez', fullName: 'Patricia Méndez', role: 'inspector', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-007', email: 'mecanico2@sigma.aero', firstName: 'Luis', lastName: 'Fernández', fullName: 'Luis Fernández', role: 'mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
  { id: 'usr-008', email: 'mecanico3@sigma.aero', firstName: 'Pablo', lastName: 'Suárez', fullName: 'Pablo Suárez', role: 'mecanico', isActive: true, createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00' },
];

export const usersService = {
  async getAll(
    filters: UserFilters = {},
    page = 1,
    pageSize = 100
  ): Promise<PaginatedResponse<User>> {
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
      ...(filters.role && { role: ROLE_TO_BACKEND[filters.role] }),
    };

    const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<Record<string, unknown>> }>(
      '/users',
      { params: { ...backendFilters, page, pageSize } }
    );
    return {
      ...data.data,
      data: data.data.data.map(normalizeUser),
    };
  },
};
