import type { DashboardData, ApiResponse } from '@/types';
import { MOCK_DASHBOARD_DATA } from '@/mocks/dashboard.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

const AIRCRAFT_STATUS_LABELS: Record<string, string> = {
  Operativa: 'Operativa',
  EnMantenimiento: 'En Mantenimiento',
  EnInspeccion: 'En Inspección',
  FueraDeServicio: 'Fuera de Servicio',
};

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      return MOCK_DASHBOARD_DATA;
    }

    const { data } = await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar dashboard');
    const raw = data.data;
    return {
      ...raw,
      aircraftByStatus: raw.aircraftByStatus.map((item) => ({
        ...item,
        name: AIRCRAFT_STATUS_LABELS[item.name] ?? item.name,
      })),
    };
  },
};
