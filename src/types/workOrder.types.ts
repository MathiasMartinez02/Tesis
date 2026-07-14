export type WorkOrderStatus =
  | 'Pendiente'
  | 'EnProceso'
  | 'EnInspeccion'
  | 'Finalizada'
  | 'Cancelada';

export type WorkOrderPriority = 'Baja' | 'Media' | 'Alta' | 'Critica';

export type WorkOrderType =
  | 'Inspeccion50h'
  | 'Inspeccion100h'
  | 'Inspeccion200h'
  | 'InspeccionAnual'
  | 'Reparacion'
  | 'Modificacion'
  | 'AdCumplimiento'
  | 'Servicio';

export type WorkOrderTaskStatus = 'Pendiente' | 'EnProceso' | 'Completada' | 'Observada';

export type WorkOrderMaterialStatus = 'Pendiente' | 'Entregado' | 'NoDisponible';

/** WorkOrderDto — lo que devuelve el listado (GET /work-orders) */
export interface WorkOrder {
  id: string;
  number: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  aircraftId: string;
  aircraftRegistration: string;
  aircraftModel: string;
  clientId: string;
  clientName: string;
  description: string;
  estimatedHours: number;
  actualHours: number;
  intakeDate: string;
  startDate?: string;
  estimatedEndDate: string;
  completedDate?: string;
  aircraftHoursAtStart: number;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedMechanic {
  userId: string;
  userName: string;
  role: string;
  assignedAt: string;
}

export interface WorkOrderTask {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  status: WorkOrderTaskStatus;
  assignedToId?: string;
  assignedToName?: string;
  estimatedHours: number;
  actualHours: number;
  completedAt?: string;
  observations?: string;
  requiresInspection: boolean;
  inspectedById?: string;
  inspectedByName?: string;
  inspectedAt?: string;
}

export interface WorkOrderTimeline {
  id: string;
  event: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  createdAt: string;
  metadata?: string;
}

export interface WorkOrderMaterial {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
  requestedAt: string;
  deliveredAt?: string;
  status: WorkOrderMaterialStatus;
}

export interface WorkOrderDocument {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  uploadedById: string;
  uploadedAt: string;
}

/** WorkOrderDetailDto — lo que devuelve GET /work-orders/{id} */
export interface WorkOrderDetail extends WorkOrder {
  tasks: WorkOrderTask[];
  timeline: WorkOrderTimeline[];
  materials: WorkOrderMaterial[];
  documents: WorkOrderDocument[];
  assignedMechanics: AssignedMechanic[];
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

export interface CreateWorkOrderPayload {
  type: WorkOrderType;
  priority: WorkOrderPriority;
  aircraftId: string;
  description: string;
  estimatedHours: number;
  intakeDate: string;
  estimatedEndDate: string;
}

export interface UpdateWorkOrderPayload {
  description: string;
  estimatedHours: number;
  intakeDate: string;
  estimatedEndDate: string;
  priority: WorkOrderPriority;
}

export interface CreateWorkOrderTaskPayload {
  title: string;
  description: string;
  estimatedHours: number;
  requiresInspection: boolean;
}

// Payload para dar de alta un material/repuesto pedido por una OT (Fase 8)
export interface CreateWorkOrderMaterialPayload {
  partNumber: string;
  description: string;
  quantity: number;
  unit: string;
}
