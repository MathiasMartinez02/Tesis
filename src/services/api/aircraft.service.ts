import type { Aircraft, AircraftFilters, AircraftStatus, AircraftCategory, PaginatedResponse } from '@/types';
import { MOCK_AIRCRAFT } from '@/mocks/aircraft.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

// ─── Normalización backend → frontend ────────────────────────────────────────

const STATUS_MAP: Record<string, AircraftStatus> = {
  Operativa: 'operativa',
  EnMantenimiento: 'en_mantenimiento',
  FueraDeServicio: 'fuera_de_servicio',
  EnInspeccion: 'en_inspeccion',
};

const CATEGORY_MAP: Record<string, AircraftCategory> = {
  Avion: 'avion',
  Helicoptero: 'helicoptero',
  Planeador: 'planeador',
  Ultraliviano: 'ultraliviano',
};

const STATUS_TO_BACKEND = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k])
) as Record<AircraftStatus, string>;

const CATEGORY_TO_BACKEND = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k])
) as Record<AircraftCategory, string>;

function normalizeAircraft(raw: Aircraft): Aircraft {
  return {
    ...raw,
    status: STATUS_MAP[raw.status as string] ?? (raw.status as AircraftStatus),
    category: CATEGORY_MAP[raw.category as string] ?? (raw.category as AircraftCategory),
  };
}

function denormalizeFilters(filters: AircraftFilters): Record<string, unknown> {
  return {
    ...filters,
    ...(filters.status && { status: STATUS_TO_BACKEND[filters.status] }),
    ...(filters.category && { category: CATEGORY_TO_BACKEND[filters.category] }),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aircraftService = {
  async getAll(
    filters: AircraftFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<Aircraft>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const filtered = MOCK_AIRCRAFT.filter((a) => {
        if (filters.status && a.status !== filters.status) return false;
        if (filters.category && a.category !== filters.category) return false;
        if (filters.clientId && a.clientId !== filters.clientId) return false;
        if (filters.search) {
          const search = filters.search.toLowerCase();
          return (
            a.registration.toLowerCase().includes(search) ||
            a.model.toLowerCase().includes(search) ||
            a.clientName.toLowerCase().includes(search)
          );
        }
        return true;
      });
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    }

    const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<Aircraft> }>('/aircraft', {
      params: { ...denormalizeFilters(filters), page, pageSize },
    });
    return {
      ...data.data,
      data: data.data.data.map(normalizeAircraft),
    };
  },

  async getById(id: string): Promise<Aircraft> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const aircraft = MOCK_AIRCRAFT.find((a) => a.id === id);
      if (!aircraft) throw new Error('Aeronave no encontrada');
      return aircraft;
    }
    const { data } = await apiClient.get<{ success: boolean; data: Aircraft }>(`/aircraft/${id}`);
    return normalizeAircraft(data.data);
  },
};
