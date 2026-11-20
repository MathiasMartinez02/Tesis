import type {
  Inspection,
  InspectionDetail,
  InspectionFilters,
  ChecklistItemStatus,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const inspectionsService = {
  async getAll(
    filters: InspectionFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Inspection>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Inspection>>>('/inspections', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar inspecciones');
    return data.data;
  },

  async getById(id: string): Promise<InspectionDetail> {
    const { data } = await apiClient.get<ApiResponse<InspectionDetail>>(`/inspections/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Inspección no encontrada');
    return data.data;
  },

  // Inicio de la inspeccion por el usuario logueado
  async start(id: string): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(`/inspections/${id}/start`);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al iniciar la inspección');
  },

  // Cierre del checklist de la inspeccion
  async complete(id: string, observations?: string): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(`/inspections/${id}/complete`, { observations });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al completar la inspección');
  },

  async approve(id: string, observations?: string): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(`/inspections/${id}/approve`, {
      observations,
    });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al aprobar inspección');
  },

  async reject(id: string, rejectionReason: string): Promise<void> {
    const { data } = await apiClient.post<ApiResponse<null>>(`/inspections/${id}/reject`, {
      rejectionReason,
    });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al rechazar inspección');
  },

  async updateChecklistItem(
    id: string,
    itemId: string,
    status: ChecklistItemStatus,
    observations?: string
  ): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(
      `/inspections/${id}/checklist/${itemId}`,
      { status, observations }
    );
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar ítem de checklist');
  },
};
