import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersService } from '@/services/api/workOrders.service';
import type { WorkOrderFilters, WorkOrder, WorkOrderPriority, AssignedMechanic } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const WORK_ORDERS_QUERY_KEY = ['work-orders'] as const;

export function useWorkOrders(filters: WorkOrderFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...WORK_ORDERS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => workOrdersService.getAll(filters, page, pageSize),
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: [...WORK_ORDERS_QUERY_KEY, id],
    queryFn: () => workOrdersService.getById(id),
    enabled: !!id,
  });
}

type UpdatePayload = {
  description: string;
  estimatedHours: number;
  estimatedEndDate: string;
  priority: WorkOrderPriority;
};

type UpdateFullPayload = {
  id: string;
  payload: UpdatePayload;
  originalMechanicIds: string[];
  newMechanics: AssignedMechanic[];
};

export function useUpdateWorkOrderFull() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: async ({ id, payload, originalMechanicIds, newMechanics }: UpdateFullPayload) => {
      const updated = await workOrdersService.update(id, payload);

      const originalSet = new Set(originalMechanicIds);
      const newSet = new Set(newMechanics.map((m) => m.userId));
      const toAdd = newMechanics.filter((m) => !originalSet.has(m.userId));
      const toRemove = originalMechanicIds.filter((uid) => !newSet.has(uid));

      await Promise.all([
        ...toAdd.map((m) => workOrdersService.addMechanic(id, m.userId)),
        ...toRemove.map((uid) => workOrdersService.removeMechanic(id, uid)),
      ]);

      return updated;
    },
    onSuccess: (updatedOrder) => {
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'OT actualizada',
        description: `${updatedOrder.number} guardada correctamente`,
        duration: 3000,
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error al guardar',
        description: 'No se pudieron guardar los cambios',
      });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      workOrdersService.update(id, payload),
    onSuccess: (updatedOrder) => {
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'OT actualizada',
        description: `${updatedOrder.number} guardada correctamente`,
        duration: 3000,
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error al guardar',
        description: 'No se pudieron guardar los cambios',
      });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrder['status'] }) =>
      workOrdersService.updateStatus(id, status),
    onSuccess: (updatedOrder) => {
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Estado actualizado',
        description: `OT ${updatedOrder.number} actualizada correctamente`,
      });
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado de la OT',
      });
    },
  });
}
