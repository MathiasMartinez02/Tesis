import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/api/inventory.service';
import type { InventoryFilters, CreateInventoryItemPayload, CreateInventoryMovementPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const INVENTORY_QUERY_KEY = ['inventory'] as const;

export function useInventory(filters: InventoryFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, filters, page, pageSize],
    queryFn: () => inventoryService.getAll(filters, page, pageSize),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, id],
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
}

export function useInventoryMovements(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, id, 'movements', page, pageSize],
    queryFn: () => inventoryService.getMovements(id, page, pageSize),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateInventoryItemPayload) => inventoryService.create(payload),
    onSuccess: (item) => {
      void queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Ítem registrado',
        description: `${item.partNumber} agregado al inventario`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al registrar ítem', description: err.message });
    },
  });
}

export function useAddInventoryMovement(itemId: string) {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateInventoryMovementPayload) =>
      inventoryService.addMovement(itemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...INVENTORY_QUERY_KEY, itemId] });
      void queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      addToast({ type: 'success', title: 'Movimiento registrado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al registrar movimiento', description: err.message });
    },
  });
}
