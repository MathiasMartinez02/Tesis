import type {
  Budget,
  BudgetFilters,
  CreateBudgetPayload,
  BudgetStatus,
  ApiResponse,
  PaginatedResult,
} from '@/types';
import apiClient from '@/lib/axios';

export const budgetsService = {
  // Trae el listado paginado de presupuestos aplicando filtros de estado y cliente
  async getAll(filters: BudgetFilters = {}, page = 1, pageSize = 10): Promise<PaginatedResult<Budget>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedResult<Budget>>>('/budgets', {
      params: { ...filters, page, pageSize },
    });
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al cargar presupuestos');
    return data.data;
  },

  // Trae el detalle de un presupuesto puntual por id
  async getById(id: string): Promise<Budget> {
    const { data } = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Presupuesto no encontrado');
    return data.data;
  },

  // Crea un nuevo presupuesto para un cliente
  async create(payload: CreateBudgetPayload): Promise<Budget> {
    const { data } = await apiClient.post<ApiResponse<Budget>>('/budgets', payload);
    if (!data.success || !data.data) throw new Error(data.errors?.[0] ?? 'Error al crear el presupuesto');
    return data.data;
  },

  // Acepta o rechaza un presupuesto existente
  async updateStatus(id: string, status: BudgetStatus): Promise<void> {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/budgets/${id}/status`, { status });
    if (!data.success) throw new Error(data.errors?.[0] ?? 'Error al actualizar el estado del presupuesto');
  },
};
