import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navigate = vi.fn();
const logoutApi = vi.fn<[], Promise<void>>();

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('@/services/api/auth.service', () => ({ authService: { logout: () => logoutApi() } }));

import { useAuthStore } from '@/store/authStore';
import { useLogout } from './useLogout';

const setup = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['work-orders'], [{ id: 'wo-1' }]);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useLogout(), { wrapper });
  return { queryClient, logout: result.current };
};

describe('useLogout', () => {
  beforeEach(() => {
    navigate.mockReset();
    logoutApi.mockReset();
    useAuthStore.setState({ isAuthenticated: true, user: { id: 'u1' } as never, tokens: null });
  });

  it('revoca la sesion en el backend, vacia la cache y redirige al login', async () => {
    logoutApi.mockResolvedValue(undefined);
    const { queryClient, logout } = setup();

    await logout();

    expect(logoutApi).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['work-orders'])).toBeUndefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });

  it('cierra la sesion local aunque falle el backend', async () => {
    logoutApi.mockRejectedValue(new Error('sin conexion'));
    const { queryClient, logout } = setup();

    await logout();

    expect(queryClient.getQueryData(['work-orders'])).toBeUndefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
