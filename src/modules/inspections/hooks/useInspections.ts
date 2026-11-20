import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionsService } from '@/services/api/inspections.service';
import type { InspectionFilters, ChecklistItemStatus } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { invalidateMaintenanceQueries } from '@/lib/maintenanceQueries';

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

// Mutacion del ciclo de inspeccion con toast y refresco de datos relacionados
function useInspectionAction<TVariables>(
  action: (variables: TVariables) => Promise<void>,
  successTitle: string,
  errorTitle: string
) {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      invalidateMaintenanceQueries(queryClient);
      addToast({ type: 'success', title: successTitle });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: errorTitle, description: err.message });
    },
  });
}

export function useStartInspection() {
  return useInspectionAction(
    (id: string) => inspectionsService.start(id),
    'Inspección iniciada',
    'Error al iniciar la inspección'
  );
}

export function useCompleteInspection() {
  return useInspectionAction(
    ({ id, observations }: { id: string; observations?: string }) => inspectionsService.complete(id, observations),
    'Inspección completada',
    'Error al completar la inspección'
  );
}

export function useApproveInspection() {
  return useInspectionAction(
    ({ id, observations }: { id: string; observations?: string }) => inspectionsService.approve(id, observations),
    'Inspección aprobada',
    'Error al aprobar la inspección'
  );
}

export function useRejectInspection() {
  return useInspectionAction(
    ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      inspectionsService.reject(id, rejectionReason),
    'Inspección rechazada: la OT vuelve a En proceso',
    'Error al rechazar la inspección'
  );
}

// Control de un item del checklist; refresca solo la inspeccion
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
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar el ítem', description: err.message });
    },
  });
}
