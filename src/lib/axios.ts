import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';

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
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/login')) {
      // Token expirado - intentar refresh
      try {
        const refreshToken = localStorage.getItem('sigma_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem(ENV.JWT_STORAGE_KEY, data.accessToken as string);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken as string}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh falló - limpiar auth y redirigir a login
        localStorage.removeItem(ENV.JWT_STORAGE_KEY);
        localStorage.removeItem('sigma_refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
