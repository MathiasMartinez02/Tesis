import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aircraftService } from '@/services/api/aircraft.service';
import type {
  AircraftFilters,
  Aircraft,
  CreateAircraftPayload,
  CreateFlightRecordPayload,
} from '@/types';
import { useUIStore } from '@/store/uiStore';

export const AIRCRAFT_QUERY_KEY = ['aircraft'] as const;

export function useAircraft(filters: AircraftFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...AIRCRAFT_QUERY_KEY, filters, page, pageSize],
    queryFn: () => aircraftService.getAll(filters, page, pageSize),
  });
}

export function useAircraftById(id: string) {
  return useQuery({
    queryKey: [...AIRCRAFT_QUERY_KEY, id],
    queryFn: () => aircraftService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAircraft() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateAircraftPayload) => aircraftService.create(payload),
    onSuccess: (aircraft) => {
      void queryClient.invalidateQueries({ queryKey: AIRCRAFT_QUERY_KEY });
      addToast({
        type: 'success',
        title: 'Aeronave registrada',
        description: `${aircraft.registration} agregada correctamente`,
      });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al registrar aeronave', description: err.message });
    },
  });
}

export function useUpdateAircraftStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Aircraft['status'] }) =>
      aircraftService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: AIRCRAFT_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...AIRCRAFT_QUERY_KEY, id] });
      addToast({ type: 'success', title: 'Estado de aeronave actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar estado', description: err.message });
    },
  });
}

export function useAddFlightRecord(aircraftId: string) {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateFlightRecordPayload) =>
      aircraftService.addFlightRecord(aircraftId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...AIRCRAFT_QUERY_KEY, aircraftId] });
      addToast({ type: 'success', title: 'Vuelo registrado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al registrar vuelo', description: err.message });
    },
  });
}
