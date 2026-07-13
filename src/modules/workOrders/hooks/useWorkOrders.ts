import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrdersService } from '@/services/api/workOrders.service';
import type {
  WorkOrderFilters,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderTaskStatus,
  AssignedMechanic,
  CreateWorkOrderPayload,
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

// ─── Create ───────────────────────────────────────────────────────────────────

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
      addToast({ type: 'error', title: 'Error al crear OT', description: err.message });
    },
  });
}

// ─── Update completo (campos + mecánicos diff) ────────────────────────────────

// MODIFICADO: incluye intakeDate para poder editar la fecha de ingreso de la OT junto con el resto de los campos
// ANTERIOR: solo tenía description, estimatedHours, estimatedEndDate y priority
type UpdatePayload = {
  description: string;
  estimatedHours: number;
  intakeDate: string;
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { title: string; description: string; estimatedHours: number; requiresInspection: boolean };
    }) => workOrdersService.addTask(id, payload),
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
