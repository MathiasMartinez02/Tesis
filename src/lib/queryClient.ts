import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes: cacheTime)
      retry: (failureCount, error) => {
        // No reintentar en errores 4xx
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status && axiosError.response.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
