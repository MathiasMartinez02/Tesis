import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aircraftService } from '@/services/api/aircraft.service';
import type {
  AircraftFilters,
  Aircraft,
  CreateAircraftPayload,
  UpdateAircraftPayload,
  CreateAircraftDocumentPayload,
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

// Actualiza los datos completos de una aeronave existente y refresca su detalle y listado
export function useUpdateAircraft() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAircraftPayload }) =>
      aircraftService.update(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [...AIRCRAFT_QUERY_KEY, id] });
      void queryClient.invalidateQueries({ queryKey: AIRCRAFT_QUERY_KEY });
      addToast({ type: 'success', title: 'Aeronave actualizada' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar aeronave', description: err.message });
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

// Trae el historial de OTs de mantenimiento asociadas a una aeronave
export function useAircraftMaintenanceHistory(aircraftId: string) {
  return useQuery({
    queryKey: [...AIRCRAFT_QUERY_KEY, aircraftId, 'maintenance-history'],
    queryFn: () => aircraftService.getMaintenanceHistory(aircraftId),
    enabled: !!aircraftId,
  });
}

// Trae los repuestos de inventario usados en OTs asociadas a una aeronave
export function useAircraftInventoryUsage(aircraftId: string) {
  return useQuery({
    queryKey: [...AIRCRAFT_QUERY_KEY, aircraftId, 'inventory-usage'],
    queryFn: () => aircraftService.getInventoryUsage(aircraftId),
    enabled: !!aircraftId,
  });
}

// Sube un documento nuevo para la aeronave y refresca su detalle al terminar
export function useAddAircraftDocument(aircraftId: string) {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateAircraftDocumentPayload) =>
      aircraftService.addDocument(aircraftId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...AIRCRAFT_QUERY_KEY, aircraftId] });
      addToast({ type: 'success', title: 'Documento cargado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al subir documento', description: err.message });
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
