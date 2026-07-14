import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/api/reports.service';
import type { WorkOrderReportFilters, InspectionReportFilters } from '@/types';

export const REPORTS_QUERY_KEY = ['reports'] as const;

export function useWorkOrdersReport(filters: WorkOrderReportFilters = {}) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'work-orders', filters],
    queryFn: () => reportsService.getWorkOrdersReport(filters),
  });
}

export function useInspectionsReport(filters: InspectionReportFilters = {}) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'inspections', filters],
    queryFn: () => reportsService.getInspectionsReport(filters),
  });
}

export function useAircraftStatusReport() {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'aircraft-status'],
    queryFn: () => reportsService.getAircraftStatusReport(),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'inventory'],
    queryFn: () => reportsService.getInventoryReport(),
  });
}

// Trae las horas de taller (ActualHours de OT) agrupadas por mes, usadas en el gráfico "Horas de Taller por Mes" de ReportsPage
export function useMonthlyWorkshopHours(months = 7) {
  return useQuery({
    queryKey: [...REPORTS_QUERY_KEY, 'monthly-hours', months],
    queryFn: () => reportsService.getMonthlyWorkshopHours(months),
  });
}
