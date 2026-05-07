export interface DashboardKPIs {
  activeWorkOrders: number;
  activeWorkOrdersDelta: number; // % change from last period
  pendingInspections: number;
  pendingInspectionsDelta: number;
  aircraftInMaintenance: number;
  completedThisMonth: number;
  completedThisMonthDelta: number;
  overdueItems: number;
}

export interface WorkOrderChartData {
  month: string;
  completadas: number;
  enProceso: number;
  pendientes: number;
}

export interface InspectionTypeData {
  name: string;
  value: number;
  color: string;
}

export interface UpcomingExpiry {
  id: string;
  type: 'inspeccion' | 'certificado' | 'componente' | 'licencia';
  description: string;
  aircraft?: string;
  dueDate: string;
  daysUntilDue: number;
  priority: 'normal' | 'warning' | 'critical';
}

export interface RecentActivity {
  id: string;
  type: 'work_order_created' | 'work_order_completed' | 'inspection_approved' | 'inspection_rejected' | 'aircraft_added' | 'part_requested';
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  referenceId?: string;
  referenceNumber?: string;
  createdAt: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  workOrderChart: WorkOrderChartData[];
  inspectionTypes: InspectionTypeData[];
  upcomingExpiries: UpcomingExpiry[];
  recentActivity: RecentActivity[];
  aircraftByStatus: { name: string; value: number; color: string }[];
}
