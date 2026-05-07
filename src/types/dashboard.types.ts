/** KpisDto */
export interface DashboardKPIs {
  activeWorkOrders: number;
  activeWorkOrdersDelta: number;
  pendingInspections: number;
  pendingInspectionsDelta: number;
  aircraftInMaintenance: number;
  completedThisMonth: number;
  completedThisMonthDelta: number;
  overdueItems: number;
}

/** WorkOrderChartDto */
export interface WorkOrderChartData {
  month: string;
  completadas: number;
  enProceso: number;
  pendientes: number;
}

/** ChartItemDto */
export interface ChartItem {
  name: string;
  value: number;
  color: string;
}

/** Alias para compatibilidad */
export type InspectionTypeData = ChartItem;

/** UpcomingExpiryDto */
export interface UpcomingExpiry {
  id: string;
  type: string;
  description: string;
  aircraft?: string;
  dueDate: string;
  daysUntilDue: number;
  priority: string;
}

/** RecentActivityDto */
export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  referenceId?: string;
  referenceNumber?: string;
  createdAt: string;
}

/** DashboardDto */
export interface DashboardData {
  kpis: DashboardKPIs;
  workOrderChart: WorkOrderChartData[];
  inspectionTypes: ChartItem[];
  aircraftByStatus: ChartItem[];
  upcomingExpiries: UpcomingExpiry[];
  recentActivity: RecentActivity[];
}
