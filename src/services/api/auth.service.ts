import type { LoginCredentials, LoginResponse } from '@/types';
import { MOCK_USERS } from '@/mocks/users.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

/** Simula autenticación cuando ENABLE_MOCK_API=true */
async function mockLogin(credentials: LoginCredentials): Promise<LoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = MOCK_USERS.find((u) => u.email === credentials.email);

  if (!user || credentials.password !== 'sigma2024') {
    throw new Error('Credenciales incorrectas');
  }

  return {
    user,
    tokens: {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-${user.id}`,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 horas
    },
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (ENV.ENABLE_MOCK_API) {
      return mockLogin(credentials);
    }
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return data;
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
