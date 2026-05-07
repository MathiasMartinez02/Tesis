import { useUIStore } from '@/store/uiStore';

/**
 * Hook de conveniencia para mostrar toasts desde cualquier componente
 */
export function useToast() {
  const addToast = useUIStore((s) => s.addToast);

  return {
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
  };
}
