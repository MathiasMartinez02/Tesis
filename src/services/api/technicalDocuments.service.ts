import type {
  TechnicalDocument,
  TechnicalDocumentFilters,
  CreateTechnicalDocumentPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const technicalDocumentsService = {
  // Trae el listado paginado de documentos técnicos, con filtro opcional por tipo/búsqueda/vencimiento
  async getAll(
    filters: TechnicalDocumentFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<TechnicalDocument>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<TechnicalDocument>>>('/technical-documents', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar la documentación técnica');
    return data.data;
  },

  // Trae el detalle de un documento técnico puntual por id
  async getById(id: string): Promise<TechnicalDocument> {
    const { data } = await apiClient.get<ApiResponse<TechnicalDocument>>(`/technical-documents/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Documento no encontrado');
    return data.data;
  },

  // Trae los documentos técnicos por vencer (ventana de 30 días), endpoint independiente del Dashboard
  async getExpiring(): Promise<TechnicalDocument[]> {
    const { data } = await apiClient.get<ApiResponse<TechnicalDocument[]>>('/technical-documents/expiring');
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar los vencimientos');
    return data.data;
  },

  // Crea un documento técnico nuevo (manual, boletín de servicio, directiva AD o certificado)
  async create(payload: CreateTechnicalDocumentPayload): Promise<TechnicalDocument> {
    const { data } = await apiClient.post<ApiResponse<TechnicalDocument>>('/technical-documents', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear el documento técnico');
    return data.data;
  },
};
