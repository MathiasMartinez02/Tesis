import type { Aircraft, AircraftFilters, PaginatedResponse } from '@/types';
import { MOCK_AIRCRAFT } from '@/mocks/aircraft.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

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

    const { data } = await apiClient.get<PaginatedResponse<Aircraft>>('/aircraft', {
      params: { ...filters, page, pageSize },
    });
    return data;
  },

  async getById(id: string): Promise<Aircraft> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const aircraft = MOCK_AIRCRAFT.find((a) => a.id === id);
      if (!aircraft) throw new Error('Aeronave no encontrada');
      return aircraft;
    }
    const { data } = await apiClient.get<Aircraft>(`/aircraft/${id}`);
    return data;
  },
};
