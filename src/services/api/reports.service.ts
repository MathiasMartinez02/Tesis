import type {
  WorkOrdersReport,
  WorkOrderReportFilters,
  InspectionsReport,
  InspectionReportFilters,
  AircraftStatusReport,
  InventoryReport,
  MonthlyWorkshopHoursReport,
  ApiResponse,
} from '@/types';
import apiClient from '@/lib/axios';

export const reportsService = {
  async getWorkOrdersReport(filters: WorkOrderReportFilters = {}): Promise<WorkOrdersReport> {
    const { data } = await apiClient.get<ApiResponse<WorkOrdersReport>>('/reports/work-orders', {
      params: filters,
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al generar reporte');
    return data.data;
  },

  async getInspectionsReport(filters: InspectionReportFilters = {}): Promise<InspectionsReport> {
    const { data } = await apiClient.get<ApiResponse<InspectionsReport>>('/reports/inspections', {
      params: filters,
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al generar reporte');
    return data.data;
  },

  async getAircraftStatusReport(): Promise<AircraftStatusReport> {
    const { data } = await apiClient.get<ApiResponse<AircraftStatusReport>>(
      '/reports/aircraft-status'
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al generar reporte');
    return data.data;
  },

  async getInventoryReport(): Promise<InventoryReport> {
    const { data } = await apiClient.get<ApiResponse<InventoryReport>>('/reports/inventory');
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al generar reporte');
    return data.data;
  },

  // Horas de taller agrupadas por mes, usadas por el gráfico "Horas de Taller por Mes" de ReportsPage
  async getMonthlyWorkshopHours(months = 7): Promise<MonthlyWorkshopHoursReport> {
    const { data } = await apiClient.get<ApiResponse<MonthlyWorkshopHoursReport>>(
      '/reports/work-orders/monthly-hours',
      { params: { months } }
    );
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al generar reporte');
    return data.data;
  },
};
