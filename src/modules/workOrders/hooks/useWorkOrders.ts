import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersService } from '@/services/api/workOrders.service';
import type {
  WorkOrderFilters,
  WorkOrder,
  WorkOrderTaskStatus,
  CreateWorkOrderPayload,
  UpdateWorkOrderPayload,
  CreateWorkOrderTaskPayload,
} from '@/types';
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

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) => workOrdersService.create(payload),
    onSuccess: (newOrder) => {
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'OT creada',
        description: `OT ${newOrder.number} creada correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Error al crear OT',
        description: err.message,
      });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkOrderPayload }) =>
      workOrdersService.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({ type: 'success', title: 'OT actualizada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar OT', description: err.message });
    },
  });
}

export function useUpdateWorkOrderStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrder['status'] }) =>
      workOrdersService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, id] });
      addToast({ type: 'success', title: 'Estado actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar estado', description: err.message });
    },
  });
}

export function useAddWorkOrderTask() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateWorkOrderTaskPayload }) =>
      workOrdersService.addTask(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, id] });
      addToast({ type: 'success', title: 'Tarea agregada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al agregar tarea', description: err.message });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      workOrderId,
      taskId,
      status,
      observations,
    }: {
      workOrderId: string;
      taskId: string;
      status: WorkOrderTaskStatus;
      observations?: string;
    }) => workOrdersService.updateTaskStatus(workOrderId, taskId, status, observations),
    onSuccess: (_, { workOrderId }) => {
      void queryClient.invalidateQueries({ queryKey: [...WORK_ORDERS_QUERY_KEY, workOrderId] });
      addToast({ type: 'success', title: 'Tarea actualizada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar tarea', description: err.message });
    },
  });
}
