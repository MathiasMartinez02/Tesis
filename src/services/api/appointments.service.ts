import type {
  Appointment,
  AppointmentFilters,
  CreateAppointmentPayload,
  AppointmentStatus,
  WorkOrder,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const appointmentsService = {
  // Trae el listado paginado de turnos aplicando filtros de estado y rango de fechas
  async getAll(
    filters: AppointmentFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Appointment>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Appointment>>>('/appointments', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar turnos');
    return data.data;
  },

  // Trae el detalle de un turno puntual por id
  async getById(id: string): Promise<Appointment> {
    const { data } = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Turno no encontrado');
    return data.data;
  },

  // Crea un nuevo turno solicitado por un cliente
  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await apiClient.post<ApiResponse<Appointment>>('/appointments', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear el turno');
    return data.data;
  },

  // Confirma o cancela un turno existente
  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/appointments/${id}/status`, { status });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar el estado del turno');
  },

  // Convierte un turno confirmado en una orden de trabajo real, sin reingresar datos
  async convertToWorkOrder(id: string): Promise<WorkOrder> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>(`/appointments/${id}/convert-to-work-order`);
    if (!data.success || !data.data) {
      throw new Error(data.errors?.[0] ?? 'Error al convertir el turno en orden de trabajo');
    }
    return data.data;
  },
};
