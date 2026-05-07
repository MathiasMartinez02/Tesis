import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersService } from '@/services/api/workOrders.service';
import type { WorkOrderFilters, WorkOrder } from '@/types';
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
