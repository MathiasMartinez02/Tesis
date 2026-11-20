import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/api/auth.service';
import { useUIStore } from '@/store/uiStore';
import { useLogout } from './useLogout';

// Cambio de contraseña propia; el backend cierra las sesiones y se vuelve a ingresar
export function useChangeOwnPassword() {
  const addToast = useUIStore((s) => s.addToast);
  const logout = useLogout();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changeOwnPassword(currentPassword, newPassword),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Contraseña actualizada',
        description: 'Ingresá de nuevo con tu contraseña nueva',
      });
      void logout();
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al cambiar la contraseña', description: err.message });
    },
  });
}

// Solicitud de cambio de contraseña al gerente
export function useForgotPassword() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'No se pudo enviar la solicitud', description: err.message });
    },
  });
}
