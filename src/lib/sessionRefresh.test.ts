import { beforeEach, describe, expect, it, vi } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('axios', () => ({ default: { post } }));
vi.mock('@/config/env', () => ({ ENV: { API_BASE_URL: 'http://api', JWT_STORAGE_KEY: 'sigma_auth_token' } }));

import { useAuthStore } from '@/store/authStore';
import { refreshAccessToken } from './sessionRefresh';

describe('refreshAccessToken', () => {
  beforeEach(() => {
    post.mockReset();
    localStorage.setItem('sigma_refresh_token', 'refresh-viejo');
    useAuthStore.setState({ tokens: { accessToken: 'a0', refreshToken: 'refresh-viejo', expiresAt: 0 } });
  });

  it('varios 401 simultaneos hacen un solo refresh', async () => {
    post.mockResolvedValue({ data: { success: true, data: { accessToken: 'a1', refreshToken: 'refresh-nuevo' } } });

    const results = await Promise.all([refreshAccessToken(), refreshAccessToken(), refreshAccessToken()]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('http://api/auth/refresh', { refreshToken: 'refresh-viejo' });
    expect(results).toEqual(['a1', 'a1', 'a1']);
  });

  it('guarda el refresh token rotado en localStorage y en el store', async () => {
    post.mockResolvedValue({ data: { success: true, data: { accessToken: 'a2', refreshToken: 'refresh-rotado' } } });

    await refreshAccessToken();

    expect(localStorage.getItem('sigma_auth_token')).toBe('a2');
    expect(localStorage.getItem('sigma_refresh_token')).toBe('refresh-rotado');
    expect(useAuthStore.getState().tokens?.refreshToken).toBe('refresh-rotado');
  });

  it('despues de un fallo permite reintentar', async () => {
    post.mockRejectedValueOnce(new Error('401'));
    await expect(refreshAccessToken()).rejects.toThrow();

    post.mockResolvedValue({ data: { success: true, data: { accessToken: 'a3', refreshToken: 'r3' } } });
    await expect(refreshAccessToken()).resolves.toBe('a3');
  });
});
