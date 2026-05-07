export type WorkOrderStatus =
  | 'pendiente'
  | 'en_proceso'
  | 'en_inspeccion'
  | 'finalizada'
  | 'cancelada';

export type WorkOrderPriority = 'baja' | 'media' | 'alta' | 'critica';

export type WorkOrderType =
  | 'inspeccion_50h'
  | 'inspeccion_100h'
  | 'inspeccion_200h'
  | 'inspeccion_anual'
  | 'reparacion'
  | 'modificacion'
  | 'ad_cumplimiento'
  | 'servicio';

export interface WorkOrder {
  id: string;
  number: string; // OT-2024-0001
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  aircraftId: string;
  aircraftRegistration: string;
  aircraftModel: string;
  clientId: string;
  clientName: string;
  description: string;
  assignedMechanics: AssignedMechanic[];
  assignedInspectorId?: string;
  assignedInspectorName?: string;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  estimatedEndDate: string;
  completedDate?: string;
  aircraftHoursAtStart: number;
  tasks: WorkOrderTask[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByName: string;
}

export interface AssignedMechanic {
  userId: string;
  userName: string;
  role: string;
  assignedAt: string;
}

export interface WorkOrderTask {
  id: string;
  workOrderId: string;
  orderIndex: number;
  title: string;
  description: string;
  status: 'pendiente' | 'en_proceso' | 'completada' | 'observada';
  assignedToId?: string;
  assignedToName?: string;
  estimatedHours: number;
  actualHours: number;
  completedAt?: string;
  observations?: string;
  requiresInspection: boolean;
  inspectedById?: string;
  inspectedAt?: string;
}

export interface WorkOrderTimeline {
  id: string;
  workOrderId: string;
  event: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface WorkOrderDetail extends WorkOrder {
  timeline: WorkOrderTimeline[];
  materials: WorkOrderMaterial[];
  documents: WorkOrderDocument[];
}

export interface WorkOrderMaterial {
  id: string;
  workOrderId: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  requestedAt: string;
  deliveredAt?: string;
  status: 'pendiente' | 'entregado' | 'no_disponible';
}

export interface WorkOrderDocument {
  id: string;
  workOrderId: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  priority?: WorkOrderPriority;
  type?: WorkOrderType;
  aircraftId?: string;
  clientId?: string;
  mechanicId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
