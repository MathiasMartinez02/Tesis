import type { WorkOrder, WorkOrderDetail, WorkOrderFilters, PaginatedResponse } from '@/types';
import { MOCK_WORK_ORDERS } from '@/mocks/workOrders.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

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

export const workOrdersService = {
  async getAll(
    filters: WorkOrderFilters = {},
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<WorkOrder>> {
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

    const { data } = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', {
      params: { ...filters, page, pageSize },
    });
    return data;
  },

  async getById(id: string): Promise<WorkOrderDetail> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = MOCK_WORK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error(`OT ${id} no encontrada`);

      return {
        ...order,
        timeline: [
          {
            id: 'tl-001',
            workOrderId: id,
            event: 'Orden de trabajo creada',
            description: `OT ${order.number} creada y asignada`,
            userId: order.createdById,
            userName: order.createdByName,
            userRole: 'Jefe de Taller',
            createdAt: order.createdAt,
          },
          {
            id: 'tl-002',
            workOrderId: id,
            event: 'Trabajo iniciado',
            description: 'Se comenzó con la revisión inicial del motor',
            userId: 'usr-003',
            userName: 'Jorge Méndez',
            userRole: 'Mecánico',
            createdAt: order.startDate ?? order.createdAt,
          },
        ],
        materials: [],
        documents: [],
      };
    }

    const { data } = await apiClient.get<WorkOrderDetail>(`/work-orders/${id}`);
    return data;
  },

  async create(payload: Partial<WorkOrder>): Promise<WorkOrder> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      const newOrder: WorkOrder = {
        ...(payload as WorkOrder),
        id: `ot-${Date.now()}`,
        number: `OT-2024-${String(MOCK_WORK_ORDERS.length + 1).padStart(4, '0')}`,
        status: 'pendiente',
        actualHours: 0,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_WORK_ORDERS.push(newOrder);
      return newOrder;
    }
    const { data } = await apiClient.post<WorkOrder>('/work-orders', payload);
    return data;
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
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
    return data;
  },
};
