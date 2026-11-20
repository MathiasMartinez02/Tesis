import type { QueryClient } from '@tanstack/react-query';

const MAINTENANCE_QUERY_KEYS = [['work-orders'], ['inspections'], ['aircraft'], ['dashboard']] as const;

// Refresca OT, inspecciones, aeronaves y dashboard tras un cambio del ciclo de mantenimiento
export function invalidateMaintenanceQueries(queryClient: QueryClient): void {
  for (const queryKey of MAINTENANCE_QUERY_KEYS) {
    void queryClient.invalidateQueries({ queryKey });
  }
}
