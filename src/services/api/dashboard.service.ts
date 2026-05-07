import type { DashboardData, ApiResponse } from '@/types';
import { MOCK_DASHBOARD_DATA } from '@/mocks/dashboard.mock';
import { ENV } from '@/config/env';
import apiClient from '@/lib/axios';

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    if (ENV.ENABLE_MOCK_API) {
      await new Promise((r) => setTimeout(r, 600));
      return MOCK_DASHBOARD_DATA;
    }

    const { data } = await apiClient.get<ApiResponse<DashboardData>>('/dashboard');
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar dashboard');
    return data.data;
  },
};
