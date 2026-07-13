import type {
  Aircraft,
  AircraftDetail,
  AircraftFilters,
  AircraftComponent,
  AircraftDocument,
  FlightRecord,
  CreateAircraftPayload,
  UpdateAircraftPayload,
  CreateAircraftDocumentPayload,
  CreateFlightRecordPayload,
  WorkOrder,
  AircraftInventoryUsageItem,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import { MOCK_AIRCRAFT } from '@/mocks/aircraft.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

export const aircraftService = {
  async getAll(
    filters: AircraftFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Aircraft>> {
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

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Aircraft>>>('/aircraft', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar aeronaves');
    return data.data;
  },

  async getById(id: string): Promise<AircraftDetail> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const aircraft = MOCK_AIRCRAFT.find((a) => a.id === id);
      if (!aircraft) throw new Error('Aeronave no encontrada');
      return { ...aircraft, documents: [], flightHistory: [], components: [] };
    }

    const { data } = await apiClient.get<ApiResponse<AircraftDetail>>(`/aircraft/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Aeronave no encontrada');
    return data.data;
  },

  async create(payload: CreateAircraftPayload): Promise<Aircraft> {
    const { data } = await apiClient.post<ApiResponse<Aircraft>>('/aircraft', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear aeronave');
    return data.data;
  },

  // Actualiza los datos completos de una aeronave existente
  async update(id: string, payload: UpdateAircraftPayload): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/aircraft/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar aeronave');
  },

  async updateStatus(id: string, status: Aircraft['status']): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/aircraft/${id}/status`, { status });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar estado');
  },

  async addFlightRecord(id: string, payload: CreateFlightRecordPayload): Promise<FlightRecord> {
    const { data } = await apiClient.post<ApiResponse<FlightRecord>>(
      `/aircraft/${id}/flight-records`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al registrar vuelo');
    return data.data;
  },

  // MODIFICADO: usa el tipo exportado CreateAircraftDocumentPayload en vez de un objeto inline
  // ANTERIOR: payload: { type: string; name: string; fileUrl: string; expiryDate?: string }
  async addDocument(
    id: string,
    payload: CreateAircraftDocumentPayload
  ): Promise<AircraftDocument> {
    const { data } = await apiClient.post<ApiResponse<AircraftDocument>>(
      `/aircraft/${id}/documents`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al subir documento');
    return data.data;
  },

  async addComponent(
    id: string,
    payload: Omit<AircraftComponent, 'id' | 'status'>
  ): Promise<AircraftComponent> {
    const { data } = await apiClient.post<ApiResponse<AircraftComponent>>(
      `/aircraft/${id}/components`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al agregar componente');
    return data.data;
  },

  // MODIFICADO: tipa el retorno como WorkOrder[] (numero, tipo, estado y fechas de cada OT) en vez de unknown[]
  // ANTERIOR: Promise<unknown[]>
  async getMaintenanceHistory(id: string): Promise<WorkOrder[]> {
    const { data } = await apiClient.get<ApiResponse<WorkOrder[]>>(`/aircraft/${id}/maintenance-history`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar historial');
    return data.data;
  },

  // Trae los repuestos de inventario usados en OTs de la aeronave (numero de parte, cantidad, fecha y OT asociada)
  async getInventoryUsage(id: string): Promise<AircraftInventoryUsageItem[]> {
    const { data } = await apiClient.get<ApiResponse<AircraftInventoryUsageItem[]>>(
      `/aircraft/${id}/inventory-usage`
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar repuestos utilizados');
    return data.data;
  },
};
