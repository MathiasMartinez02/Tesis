import type {
  WorkOrdersReport,
  WorkOrderReportFilters,
  InspectionsReport,
  InspectionReportFilters,
  AircraftStatusReport,
  InventoryReport,
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
};
