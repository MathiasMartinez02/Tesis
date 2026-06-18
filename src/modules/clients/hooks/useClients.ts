import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService } from '@/services/api/clients.service';
import type { ClientFilters, CreateClientPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const CLIENTS_QUERY_KEY = ['clients'] as const;

export function useClients(filters: ClientFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => clientsService.getAll(filters, page, pageSize),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsService.create(payload),
    onSuccess: (client) => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Cliente creado',
        description: `${client.name} registrado correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al crear cliente', description: err.message });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateClientPayload }) =>
      clientsService.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...CLIENTS_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      addToast({ type: 'success', title: 'Cliente actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar cliente', description: err.message });
    },
  });
}
