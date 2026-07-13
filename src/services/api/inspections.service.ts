import type {
  Inspection,
  InspectionDetail,
  InspectionFilters,
  ChecklistItemStatus,
  CreateInspectionPayload,
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

  // Crea y programa una nueva inspección
  async create(payload: CreateInspectionPayload): Promise<Inspection> {
    const { data } = await apiClient.post<ApiResponse<Inspection>>('/inspections', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al programar inspección');
    return data.data;
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
