import type { WorkOrderStatus, WorkOrderType } from './workOrder.types';
import type { Aircraft } from './aircraft.types';
import type { InventoryItem } from './inventory.types';

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

export interface InspectionsReport {
  inspections: unknown[];
  totalCount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
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
