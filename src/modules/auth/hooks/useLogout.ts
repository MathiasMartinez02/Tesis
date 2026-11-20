import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/api/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

// Cierre de sesion: revoca tokens en el backend y limpia cache y store
export function useLogout(): () => Promise<void> {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.logout);

  return useCallback(async () => {
    await authService.logout().catch(() => undefined);
    queryClient.clear();
    clearSession();
    navigate(ROUTES.LOGIN);
  }, [navigate, queryClient, clearSession]);
}
