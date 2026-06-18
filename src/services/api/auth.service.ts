import type { LoginCredentials, LoginResponse, UserRole, UserPermissions, AuthUser } from '@/types';
import { MOCK_USERS } from '@/mocks/users.mock';
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

interface BackendUser extends Omit<AuthUser, 'role' | 'permissions'> {
  role: string;
  permissions: string[];
}

function normalizeUser(backendUser: BackendUser): AuthUser {
  const role = (ROLE_MAP[backendUser.role] ?? backendUser.role.toLowerCase()) as UserRole;
  const permissions = Object.fromEntries(
    backendUser.permissions.map((p) => [p, true])
  ) as UserPermissions;
  return { ...backendUser, role, permissions };
}

/** Simula autenticación cuando ENABLE_MOCK_API=true */
async function mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find((u) => u.email === credentials.email);

  if (!user || credentials.password !== 'sigma2026') {
    throw new Error('Credenciales incorrectas');
  }

  return {
    user,
    tokens: {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    },
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ENV.ENABLE_MOCK_API) {
      return mockLogin(credentials);
    }
    const { data } = await apiClient.post<{ success: boolean; data: { user: BackendUser; tokens: LoginResponse['tokens'] } }>('/auth/login', credentials);
    return {
      user: normalizeUser(data.data.user),
      tokens: data.data.tokens,
    };
  },

  async logout(): Promise<void> {
    if (ENV.ENABLE_MOCK_API) return;
    await apiClient.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (ENV.ENABLE_MOCK_API) {
      return { accessToken: `mock-refreshed-${Date.now()}` };
    }
    const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return data;
  },
};
