import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api/dashboard.service';
import type { DashboardData } from '@/types';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useDashboard() {
  return useQuery<DashboardData, Error>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardService.getData(),
    staleTime: 2 * 60 * 1000, // 2 minutos - datos del dashboard se refrescan más seguido
    refetchInterval: 5 * 60 * 1000, // Auto-refresh cada 5 minutos
  });
}
