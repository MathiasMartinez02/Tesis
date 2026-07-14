import type {
  LoginCredentials,
  LoginResponse,
  LoginResponseDto,
  UserPermissions,
} from '@/types';
import { MOCK_USERS } from '@/mocks/users.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

/** Convierte el array de policies del backend al objeto UserPermissions del frontend */
function mapPermissions(permissions: string[]): UserPermissions {
  const set = new Set(permissions);
  return {
    canViewDashboard: set.has('CanViewDashboard'),
    canManageWorkOrders: set.has('CanManageWorkOrders'),
    canApproveInspections: set.has('CanApproveInspections'),
    canManageInventory: set.has('CanManageInventory'),
    canManageUsers: set.has('CanManageUsers'),
    canViewReports: set.has('CanViewReports'),
    canManageAircraft: set.has('CanManageAircraft'),
    canManageClients: set.has('CanManageClients'),
    canSignDocuments: set.has('CanSignDocuments'),
  };
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

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (ENV.ENABLE_MOCK_API) {
      return { accessToken: `mock-refreshed-${Date.now()}` };
    }
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
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

  // Paso 1 de "olvidé mi contraseña": genera un token de un solo uso. MVP sin envio de email real
  // (no hay infraestructura de correo en el proyecto): el token se devuelve en la respuesta.
  async forgotPassword(email: string): Promise<{ resetToken: string; expiresAt: string }> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      return { resetToken: `mock-reset-${Date.now()}`, expiresAt: new Date(Date.now() + 3600_000).toISOString() };
    }
    const { data } = await apiClient.post<ApiResponse<{ resetToken: string; expiresAt: string }>>(
      '/auth/forgot-password',
      { email }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'No se pudo generar el token de reseteo');
    return data.data;
  },

  // Paso 2: aplica la nueva contraseña usando el token generado en el paso 1
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      return;
    }
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/reset-password', {
      token,
      newPassword,
    });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Token inválido o expirado');
  },
};
