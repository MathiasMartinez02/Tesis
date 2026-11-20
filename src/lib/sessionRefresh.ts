import axios from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse } from '@/types';
import type { RefreshResult } from '@/services/api/auth.service';

const REFRESH_TOKEN_KEY = 'sigma_refresh_token';

let inFlight: Promise<string> | null = null;

// Pide tokens nuevos y guarda el refresh token rotado
async function requestNewTokens(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No hay refresh token');

  const { data } = await axios.post<ApiResponse<RefreshResult>>(`${ENV.API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  if (!data.success || !data.data?.accessToken || !data.data.refreshToken) throw new Error('No se pudo renovar la sesión');

  const { accessToken, refreshToken: rotated } = data.data;
  localStorage.setItem(ENV.JWT_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, rotated);

  const { tokens, setTokens } = useAuthStore.getState();
  if (tokens) setTokens({ ...tokens, accessToken, refreshToken: rotated });

  return accessToken;
}

// Renueva el access token una sola vez aunque haya varios 401 simultaneos
export function refreshAccessToken(): Promise<string> {
  inFlight ??= requestNewTokens().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
