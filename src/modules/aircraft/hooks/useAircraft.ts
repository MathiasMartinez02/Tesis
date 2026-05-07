import { useQuery } from '@tanstack/react-query';
import { aircraftService } from '@/services/api/aircraft.service';
import type { AircraftFilters } from '@/types';

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
