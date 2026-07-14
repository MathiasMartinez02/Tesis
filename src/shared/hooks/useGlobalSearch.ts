import { useQuery } from '@tanstack/react-query';
import { aircraftService } from '@/services/api/aircraft.service';
import { workOrdersService } from '@/services/api/workOrders.service';
import { clientsService } from '@/services/api/clients.service';

export interface GlobalSearchResult {
  id: string;
  type: 'aircraft' | 'workOrder' | 'client';
  title: string;
  subtitle: string;
}

// Busca en paralelo por matricula de aeronave, numero de OT y nombre de cliente contra los
// endpoints ya existentes (Fase 8: alcance simple, sin motor de busqueda dedicado).
// Se dispara solo con 2+ caracteres para no golpear los 3 endpoints en cada tecla del usuario.
export function useGlobalSearch(term: string) {
  const trimmed = term.trim();

  return useQuery({
    queryKey: ['global-search', trimmed],
    queryFn: async (): Promise<GlobalSearchResult[]> => {
      const [aircraft, workOrders, clients] = await Promise.all([
        aircraftService.getAll({ search: trimmed }, 1, 5),
        workOrdersService.getAll({ search: trimmed }, 1, 5),
        clientsService.getAll({ search: trimmed }, 1, 5),
      ]);

      return [
        ...aircraft.data.map((a) => ({
          id: a.id,
          type: 'aircraft' as const,
          title: a.registration,
          subtitle: `${a.model} · ${a.clientName}`,
        })),
        ...workOrders.data.map((o) => ({
          id: o.id,
          type: 'workOrder' as const,
          title: o.number,
          subtitle: `${o.aircraftRegistration} · ${o.clientName}`,
        })),
        ...clients.data.map((c) => ({
          id: c.id,
          type: 'client' as const,
          title: c.name,
          subtitle: c.email ?? c.businessName ?? '',
        })),
      ];
    },
    enabled: trimmed.length >= 2,
    staleTime: 10_000,
  });
}
