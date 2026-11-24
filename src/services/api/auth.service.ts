import type {
  LoginCredentials,
  LoginResponse,
  LoginResponseDto,
  UserPermissions,
} from '@/types';
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

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
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
    await apiClient.post('/auth/logout');
  },

  // Renueva la sesion; el backend rota el refresh token
  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    const { data } = await apiClient.post<ApiResponse<RefreshResult>>(
      '/auth/refresh',
      { refreshToken }
    );
    if (!data.success || !data.data) throw new Error('Refresh token inválido');
    return data.data;
  },

  // Cambio de contraseña del propio usuario autenticado (PATCH /auth/me/password)
  async changeOwnPassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>('/auth/me/password', {
      currentPassword,
      newPassword,
    });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al cambiar la contraseña');
  },

  // Solicitud de cambio de contraseña (avisa al gerente)
  async forgotPassword(email: string): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'No se pudo enviar la solicitud');
  },
};
