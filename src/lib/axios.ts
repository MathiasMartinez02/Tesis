import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import type { ApiResponse } from '@/types';

const BASE_URL = ENV.API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ENV.JWT_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // No interceptar 401 del propio endpoint de login (evita redirect/loop)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('sigma_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        if (!data.success || !data.data?.accessToken) throw new Error('Refresh failed');

        const newAccessToken = data.data.accessToken;
        localStorage.setItem(ENV.JWT_STORAGE_KEY, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem(ENV.JWT_STORAGE_KEY);
        localStorage.removeItem('sigma_refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
