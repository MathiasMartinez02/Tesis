import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionsService } from '@/services/api/inspections.service';
import type { InspectionFilters, ChecklistItemStatus, CreateInspectionPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const INSPECTIONS_QUERY_KEY = ['inspections'] as const;

export function useInspections(filters: InspectionFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...INSPECTIONS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => inspectionsService.getAll(filters, page, pageSize),
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: [...INSPECTIONS_QUERY_KEY, id],
    queryFn: () => inspectionsService.getById(id),
    enabled: !!id,
  });
}

// Crea una nueva inspección, invalida el listado y muestra el toast correspondiente
export function useCreateInspection() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateInspectionPayload) => inspectionsService.create(payload),
    onSuccess: (inspection) => {
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Inspección programada',
        description: `Inspección de ${inspection.aircraftRegistration} programada correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al programar inspección', description: err.message });
    },
  });
}

export function useApproveInspection() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, observations }: { id: string; observations?: string }) =>
      inspectionsService.approve(id, observations),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...INSPECTIONS_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY });
      addToast({ type: 'success', title: 'Inspección aprobada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al aprobar inspección', description: err.message });
    },
  });
}

export function useRejectInspection() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      inspectionsService.reject(id, rejectionReason),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...INSPECTIONS_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY });
      addToast({ type: 'success', title: 'Inspección rechazada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al rechazar inspección', description: err.message });
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      inspectionId,
      itemId,
      status,
      observations,
    }: {
      inspectionId: string;
      itemId: string;
      status: ChecklistItemStatus;
      observations?: string;
    }) => inspectionsService.updateChecklistItem(inspectionId, itemId, status, observations),
    onSuccess: (_, { inspectionId }) => {
      void queryClient.invalidateQueries({ queryKey: [...INSPECTIONS_QUERY_KEY, inspectionId] });
      addToast({ type: 'success', title: 'Ítem actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar ítem', description: err.message });
    },
  });
}
