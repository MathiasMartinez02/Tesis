import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/api/auth.service';
import { useUIStore } from '@/store/uiStore';

// Cambia la contraseña del usuario autenticado (requiere la actual, valida en el backend)
export function useChangeOwnPassword() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changeOwnPassword(currentPassword, newPassword),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Contraseña actualizada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al cambiar la contraseña', description: err.message });
    },
  });
}

// Paso 1 del flujo de recuperación: solicita el token de reseteo (MVP, sin envío de email real)
export function useForgotPassword() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'No se pudo generar el token', description: err.message });
    },
  });
}

// Paso 2 del flujo de recuperación: aplica la nueva contraseña con el token del paso 1
export function useResetPassword() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Contraseña restablecida', description: 'Ya podés iniciar sesión con tu nueva contraseña' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al restablecer la contraseña', description: err.message });
    },
  });
}
