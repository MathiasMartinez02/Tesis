import type { WorkOrder, WorkOrderDetail, WorkOrderFilters, PaginatedResponse, WorkOrderStatus, WorkOrderPriority, WorkOrderType } from '@/types';
import { MOCK_WORK_ORDERS } from '@/mocks/workOrders.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

// ─── Normalización backend → frontend ────────────────────────────────────────

const STATUS_MAP: Record<string, WorkOrderStatus> = {
  Pendiente: 'pendiente',
  EnProceso: 'en_proceso',
  EnInspeccion: 'en_inspeccion',
  Finalizada: 'finalizada',
  Cancelada: 'cancelada',
};

const PRIORITY_MAP: Record<string, WorkOrderPriority> = {
  Baja: 'baja',
  Media: 'media',
  Alta: 'alta',
  Critica: 'critica',
};

const TYPE_MAP: Record<string, WorkOrderType> = {
  Inspeccion50h: 'inspeccion_50h',
  Inspeccion100h: 'inspeccion_100h',
  Inspeccion200h: 'inspeccion_200h',
  InspeccionAnual: 'inspeccion_anual',
  Reparacion: 'reparacion',
  Modificacion: 'modificacion',
  AdCumplimiento: 'ad_cumplimiento',
  Servicio: 'servicio',
};

function normalizeWorkOrder(raw: WorkOrder): WorkOrder {
  return {
    ...raw,
    status: STATUS_MAP[raw.status as string] ?? (raw.status as WorkOrderStatus),
    priority: PRIORITY_MAP[raw.priority as string] ?? (raw.priority as WorkOrderPriority),
    type: TYPE_MAP[raw.type as string] ?? (raw.type as WorkOrderType),
    assignedMechanics: raw.assignedMechanics ?? [],
    tasks: raw.tasks ?? [],
    createdById: raw.createdById ?? '',
    createdByName: raw.createdByName ?? '',
  };
}

// ─── Conversión frontend → backend (para enviar filtros) ─────────────────────

const STATUS_TO_BACKEND = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k])
) as Record<WorkOrderStatus, string>;

const PRIORITY_TO_BACKEND = Object.fromEntries(
  Object.entries(PRIORITY_MAP).map(([k, v]) => [v, k])
) as Record<WorkOrderPriority, string>;

const TYPE_TO_BACKEND = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([k, v]) => [v, k])
) as Record<WorkOrderType, string>;

function denormalizeFilters(filters: WorkOrderFilters): Record<string, unknown> {
  return {
    ...filters,
    ...(filters.status && { status: STATUS_TO_BACKEND[filters.status] }),
    ...(filters.priority && { priority: PRIORITY_TO_BACKEND[filters.priority] }),
    ...(filters.type && { type: TYPE_TO_BACKEND[filters.type] }),
  };
}

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

    const { data } = await apiClient.get<{ success: boolean; data: PaginatedResponse<WorkOrder> }>('/work-orders', {
      params: { ...denormalizeFilters(filters), page, pageSize },
    });
    return {
      ...data.data,
      data: data.data.data.map(normalizeWorkOrder),
    };
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

    const { data } = await apiClient.get<{ success: boolean; data: WorkOrderDetail }>(`/work-orders/${id}`);
    const normalized = normalizeWorkOrder(data.data) as WorkOrderDetail;
    return {
      ...normalized,
      timeline: data.data.timeline ?? [],
      materials: data.data.materials ?? [],
      documents: data.data.documents ?? [],
    };
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
    const { data } = await apiClient.post<{ success: boolean; data: WorkOrder }>('/work-orders', payload);
    return normalizeWorkOrder(data.data);
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
    const { data } = await apiClient.put<{ success: boolean; data: WorkOrder }>(`/work-orders/${id}`, {
      description: payload.description,
      estimatedHours: payload.estimatedHours,
      estimatedEndDate: payload.estimatedEndDate,
      priority: PRIORITY_TO_BACKEND[payload.priority],
    });
    return normalizeWorkOrder(data.data);
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

  async updateStatus(id: string, status: WorkOrder['status']): Promise<WorkOrder> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 300));
      const order = MOCK_WORK_ORDERS.find((o) => o.id === id);
      if (!order) throw new Error('OT no encontrada');
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    const { data } = await apiClient.patch<{ success: boolean; data: WorkOrder }>(`/work-orders/${id}/status`, { status });
    return normalizeWorkOrder(data.data);
  },
};
