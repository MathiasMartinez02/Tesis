import type {
  WorkOrder,
  WorkOrderDetail,
  WorkOrderFilters,
  WorkOrderPriority,
  WorkOrderTask,
  WorkOrderTaskStatus,
  WorkOrderMaterial,
  WorkOrderMaterialStatus,
  CreateWorkOrderPayload,
  CreateWorkOrderMaterialPayload,
  CreateWorkOrderDocumentPayload,
  WorkOrderDocument,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

// ─── Service ──────────────────────────────────────────────────────────────────

export const workOrdersService = {
  // Todas las OT que cumplen el filtro (recorre las paginas de a 100)
  async getAllMatching(filters: WorkOrderFilters = {}): Promise<WorkOrder[]> {
    const pageSize = 100;
    const first = await workOrdersService.getAll(filters, 1, pageSize);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
        workOrdersService.getAll(filters, i + 2, pageSize)
      )
    );
    return [first, ...rest].flatMap((result) => result.data);
  },

  async getAll(
    filters: WorkOrderFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<WorkOrder>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<WorkOrder>>>('/work-orders', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar órdenes de trabajo');
    return data.data;
  },

  async getById(id: string): Promise<WorkOrderDetail> {
    const { data } = await apiClient.get<ApiResponse<WorkOrderDetail>>(`/work-orders/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'OT no encontrada');
    return {
      ...data.data,
      timeline: data.data.timeline ?? [],
      materials: data.data.materials ?? [],
      documents: data.data.documents ?? [],
      assignedMechanics: data.data.assignedMechanics ?? [],
    };
  },

  async create(payload: CreateWorkOrderPayload): Promise<WorkOrder> {
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>('/work-orders', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear OT');
    return data.data;
  },

  async update(
    id: string,
    payload: {
      description: string;
      estimatedHours: number;
      intakeDate: string;
      estimatedEndDate: string;
      priority: WorkOrderPriority;
    }
  ): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<null>>(`/work-orders/${id}`, payload);
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar OT');
  },

  async updateStatus(id: string, status: WorkOrder['status']): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/work-orders/${id}/status`, { status });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Transición de estado inválida');
  },

  async addMechanic(workOrderId: string, userId: string): Promise<void> {
    await apiClient.post(`/work-orders/${workOrderId}/mechanics`, { userId });
  },

  async removeMechanic(workOrderId: string, userId: string): Promise<void> {
    await apiClient.delete(`/work-orders/${workOrderId}/mechanics/${userId}`);
  },

  async addTask(
    id: string,
    payload: { title: string; description: string; estimatedHours: number; requiresInspection: boolean }
  ): Promise<WorkOrderTask> {
    const { data } = await apiClient.post<ApiResponse<WorkOrderTask>>(`/work-orders/${id}/tasks`, payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al agregar tarea');
    return data.data;
  },

  // Cambio de estado de una tarea; completar requiere horas reales
  async updateTaskStatus(
    id: string,
    taskId: string,
    status: WorkOrderTaskStatus,
    observations?: string,
    actualHours?: number
  ): Promise<void> {
    await apiClient.patch(`/work-orders/${id}/tasks/${taskId}/status`, { status, observations, actualHours });
  },

  // Asigna la tarea a un mecanico de la OT (null la deja sin responsable)
  async assignTask(id: string, taskId: string, userId: string | null): Promise<void> {
    await apiClient.patch(`/work-orders/${id}/tasks/${taskId}/assignee`, { userId });
  },

  // Adjunta un documento a la OT
  async addDocument(id: string, payload: CreateWorkOrderDocumentPayload): Promise<WorkOrderDocument> {
    const { data } = await apiClient.post<ApiResponse<WorkOrderDocument>>(`/work-orders/${id}/documents`, payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al adjuntar el documento');
    return data.data;
  },

  // Agrega un material/repuesto pedido a una OT
  async addMaterial(id: string, payload: CreateWorkOrderMaterialPayload): Promise<WorkOrderMaterial> {
    const { data } = await apiClient.post<ApiResponse<WorkOrderMaterial>>(`/work-orders/${id}/materials`, payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al agregar material');
    return data.data;
  },

  // Marca un material de OT como Entregado o No disponible
  async updateMaterialStatus(id: string, materialId: string, status: WorkOrderMaterialStatus): Promise<void> {
    await apiClient.patch(`/work-orders/${id}/materials/${materialId}/status`, { status });
  },
};
