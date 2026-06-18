import type {
  WorkOrder,
  WorkOrderDetail,
  WorkOrderFilters,
  WorkOrderPriority,
  WorkOrderTask,
  WorkOrderTaskStatus,
  CreateWorkOrderPayload,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import { MOCK_WORK_ORDERS } from '@/mocks/workOrders.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

// ─── Helpers mock ─────────────────────────────────────────────────────────────

function applyFilters(orders: WorkOrder[], filters: WorkOrderFilters): WorkOrder[] {
  return orders.filter((order) => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.priority && order.priority !== filters.priority) return false;
    if (filters.type && order.type !== filters.type) return false;
    if (filters.aircraftId && order.aircraftId !== filters.aircraftId) return false;
    if (filters.clientId && order.clientId !== filters.clientId) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        order.number.toLowerCase().includes(search) ||
        order.aircraftRegistration.toLowerCase().includes(search) ||
        order.clientName.toLowerCase().includes(search) ||
        order.description.toLowerCase().includes(search)
      );
    }
    return true;
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const workOrdersService = {
  async getAll(
    filters: WorkOrderFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<WorkOrder>> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      const filtered = applyFilters(MOCK_WORK_ORDERS, filters);
      const start = (page - 1) * pageSize;
      return {
        data: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      };
    }

    const { data } = await apiClient.get<ApiResponse<PaginatedResult<WorkOrder>>>('/work-orders', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar órdenes de trabajo');
    return data.data;
  },

  async getById(id: string): Promise<WorkOrderDetail> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = MOCK_WORK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error(`OT ${id} no encontrada`);
      return {
        ...order,
        tasks: [],
        timeline: [
          {
            id: 'tl-001',
            event: 'Orden de trabajo creada',
            description: `OT ${order.number} creada y asignada`,
            userId: 'usr-001',
            userName: 'Carlos Rodríguez',
            userRole: 'Gerente',
            createdAt: order.createdAt,
          },
        ],
        materials: [],
        documents: [],
        assignedMechanics: [],
      };
    }

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
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      const newOrder: WorkOrder = {
        ...(payload as unknown as WorkOrder),
        id: `ot-${Date.now()}`,
        number: `OT-2026-${String(MOCK_WORK_ORDERS.length + 1).padStart(4, '0')}`,
        status: 'Pendiente',
        actualHours: 0,
        taskCount: 0,
        completedTaskCount: 0,
        aircraftHoursAtStart: 0,
        aircraftModel: '',
        aircraftRegistration: '',
        clientName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_WORK_ORDERS.push(newOrder);
      return newOrder;
    }
    const { data } = await apiClient.post<ApiResponse<WorkOrder>>('/work-orders', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear OT');
    return data.data;
  },

  async update(
    id: string,
    payload: { description: string; estimatedHours: number; estimatedEndDate: string; priority: WorkOrderPriority }
  ): Promise<WorkOrder> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      const order = MOCK_WORK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error('OT no encontrada');
      Object.assign(order, payload, { updatedAt: new Date().toISOString() });
      return order;
    }
    const { data } = await apiClient.put<ApiResponse<WorkOrder>>(`/work-orders/${id}`, payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al actualizar OT');
    return data.data;
  },

  async updateStatus(id: string, status: WorkOrder['status']): Promise<WorkOrder> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = MOCK_WORK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error('OT no encontrada');
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    const { data } = await apiClient.patch<ApiResponse<WorkOrder>>(`/work-orders/${id}/status`, { status });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Transición de estado inválida');
    return data.data;
  },

  async addMechanic(workOrderId: string, userId: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.post(`/work-orders/${workOrderId}/mechanics`, { userId });
  },

  async removeMechanic(workOrderId: string, userId: string): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 200));
      return;
    }
    await apiClient.delete(`/work-orders/${workOrderId}/mechanics/${userId}`);
  },

  async addTask(
    id: string,
    payload: { title: string; description: string; estimatedHours: number; requiresInspection: boolean }
  ): Promise<WorkOrderTask> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 400));
      throw new Error('addTask no disponible en modo mock');
    }
    const { data } = await apiClient.post<ApiResponse<WorkOrderTask>>(`/work-orders/${id}/tasks`, payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al agregar tarea');
    return data.data;
  },

  async updateTaskStatus(
    id: string,
    taskId: string,
    status: WorkOrderTaskStatus,
    observations?: string
  ): Promise<void> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      return;
    }
    await apiClient.patch(`/work-orders/${id}/tasks/${taskId}/status`, { status, observations });
  },
};
