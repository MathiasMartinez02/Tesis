import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsService } from '@/services/api/budgets.service';
import type { BudgetFilters, BudgetStatus, CreateBudgetPayload } from '@/types';
import { useUIStore } from '@/store/uiStore';

export const BUDGETS_QUERY_KEY = ['budgets'] as const;

// Trae el listado paginado de presupuestos según filtros, página y tamaño de página
export function useBudgets(filters: BudgetFilters = {}, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => budgetsService.getAll(filters, page, pageSize),
  });
}

// Trae el detalle de un presupuesto puntual por id
export function useBudget(id: string) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, id],
    queryFn: () => budgetsService.getById(id),
    enabled: !!id,
  });
}

// Crea un presupuesto nuevo y refresca el listado, mostrando un toast de resultado
export function useCreateBudget() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) => budgetsService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      addToast({ type: 'success', title: 'Presupuesto creado', description: 'El presupuesto se registró correctamente' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al crear el presupuesto', description: err.message });
    },
  });
}

// Acepta o rechaza un presupuesto existente y refresca listado y detalle
export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) => budgetsService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...BUDGETS_QUERY_KEY, id] });
      addToast({ type: 'success', title: 'Estado del presupuesto actualizado' });
    },
    onError: (err: Error) => {
      addToast({ type: 'error', title: 'Error al actualizar el presupuesto', description: err.message });
    },
  });
}
