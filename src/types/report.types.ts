import type { WorkOrderStatus, WorkOrderType } from './workOrder.types';
import type { Aircraft } from './aircraft.types';
import type { InventoryItem } from './inventory.types';
import type { Inspection } from './inspection.types';

export interface WorkOrderReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: WorkOrderStatus;
  type?: WorkOrderType;
  clientId?: string;
}

export interface WorkOrderReportItem {
  id: string;
  number: string;
  type: string;
  status: string;
  priority: string;
  aircraftRegistration: string;
  aircraftModel: string;
  clientName: string;
  description: string;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  estimatedEndDate: string;
  completedDate?: string;
  createdAt: string;
}

export interface WorkOrdersReport {
  workOrders: WorkOrderReportItem[];
  totalCount: number;
  averageHours: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

export interface InspectionReportFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  inspectorId?: string;
}

// MODIFICADO: se tipa `inspections` como `Inspection[]` (antes `unknown[]`) y se agregan los campos de cumplimiento normativo (completedCount/onTimeCount/compliancePercentage)
// ANTERIOR: solo inspections (unknown[]), totalCount, byStatus, byType
export interface InspectionsReport {
  inspections: Inspection[];
  totalCount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  // Cantidad de inspecciones completadas (con fecha de finalización cargada) dentro del período consultado
  completedCount: number;
  // De las completadas, cuántas se realizaron en o antes de la fecha programada
  onTimeCount: number;
  // Porcentaje de cumplimiento normativo (onTimeCount / completedCount). Null si no hay inspecciones completadas en el período
  compliancePercentage: number | null;
}

export interface AircraftStatusReport {
  aircraft: Aircraft[];
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface InventoryReport {
  items: InventoryItem[];
  lowStockCount: number;
  outOfStockCount: number;
  expiredCount: number;
  totalValue: number;
}

// Item de horas de taller (suma de ActualHours de las OT) agrupado por mes calendario
export interface MonthlyWorkshopHoursItem {
  year: number;
  month: number;
  label: string;
  totalHours: number;
}

export interface MonthlyWorkshopHoursReport {
  items: MonthlyWorkshopHoursItem[];
}
