import type {
  LoginCredentials,
  LoginResponse,
  LoginResponseDto,
  UserPermissions,
} from '@/types';
import { MOCK_USERS } from '@/mocks/users.mock';
import { ENV } from '@/config/env';
import { buildPermissions } from '@/constants/roles';
import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

// Permisos del login (camelCase, igual que User.GetPermissions)
export function mapPermissions(permissions: string[]): UserPermissions {
  return buildPermissions(permissions);
}

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
      expiresAt: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    },
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ENV.ENABLE_MOCK_API) {
      return mockLogin(credentials);
    }

    const { data } = await apiClient.post<ApiResponse<LoginResponseDto>>(
      '/auth/login',
      credentials
    );

    if (!data.success || !data.data) {
      throw new Error(data.errors?.[0] ?? 'Error al iniciar sesión');
    }

    const { user: userDto, tokens } = data.data;

    return {
      user: {
        id: userDto.id,
        email: userDto.email,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        role: userDto.role,
        permissions: mapPermissions(userDto.permissions),
        avatarUrl: userDto.avatarUrl,
        licenseNumber: userDto.licenseNumber,
        isActive: userDto.isActive,
        lastLoginAt: userDto.lastLoginAt,
      },
      tokens,
    };
  },

  async logout(): Promise<void> {
    if (ENV.ENABLE_MOCK_API) return;
    await apiClient.post('/auth/logout');
  },

  // Renueva la sesion; el backend rota el refresh token
  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    if (ENV.ENABLE_MOCK_API) {
      return { accessToken: `mock-refreshed-${Date.now()}`, refreshToken };
    }
    const { data } = await apiClient.post<ApiResponse<RefreshResult>>(
      '/auth/refresh',
      { refreshToken }
    );
    if (!data.success || !data.data) throw new Error('Refresh token inválido');
    return data.data;
  },

  // Cambio de contraseña del propio usuario autenticado (PATCH /auth/me/password)
  async changeOwnPassword(currentPassword: string, newPassword: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      return;
    }
    const { data } = await apiClient.patch<ApiResponse<null>>('/auth/me/password', {
      currentPassword,
      newPassword,
    });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al cambiar la contraseña');
  },

  // Solicitud de cambio de contraseña (avisa al gerente)
  async forgotPassword(email: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      return;
    }
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'No se pudo enviar la solicitud');
  },
};
