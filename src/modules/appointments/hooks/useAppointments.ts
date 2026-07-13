import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@/services/api/appointments.service';
import type { AppointmentFilters, AppointmentStatus, CreateAppointmentPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';
import { WORK_ORDERS_QUERY_KEY } from '@/modules/workOrders/hooks/useWorkOrders';

export const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

// Trae el listado paginado de turnos según filtros, página y tamaño de página
export function useAppointments(filters: AppointmentFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => appointmentsService.getAll(filters, page, pageSize),
  });
}

// Trae el detalle de un turno puntual por id
export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => appointmentsService.getById(id),
    enabled: !!id,
  });
}

// Crea un turno nuevo y refresca el listado, mostrando un toast de resultado
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      addToast({ type: 'success', title: 'Turno creado', description: 'El turno se registró correctamente' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al crear el turno', description: err.message });
    },
  });
}

// Confirma o cancela un turno existente y refresca listado y detalle
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentsService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, id] });
      addToast({ type: 'success', title: 'Estado del turno actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar el turno', description: err.message });
    },
  });
}

// Convierte un turno confirmado en OT real, refresca turnos y OTs, y muestra un toast con el resultado
export function useConvertAppointmentToWorkOrder() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => appointmentsService.convertToWorkOrder(id),
    onSuccess: (workOrder) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: WORK_ORDERS_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Turno convertido en OT',
        description: `OT ${workOrder.number} creada correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al convertir el turno', description: err.message });
    },
  });
}
