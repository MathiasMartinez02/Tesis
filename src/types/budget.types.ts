/** Estados posibles de un presupuesto. Vencido lo calcula el backend al vuelo (no es un valor que se setee manualmente) */
export type BudgetStatus = 'Pendiente' | 'Aceptado' | 'Rechazado' | 'Vencido';

/** BudgetDto — lo que devuelve el listado y el detalle (GET /budgets, GET /budgets/{id}) */
export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  aircraftId?: string | null;
  aircraftRegistration?: string | null;
  appointmentId?: string | null;
  description: string;
  amount: number;
  validUntil: string;
  status: BudgetStatus;
  notes?: string | null;
  createdAt: string;
}

export interface BudgetFilters {
  status?: BudgetStatus;
  clientId?: string;
}

/** Payload para crear un presupuesto (POST /budgets). ValidUntil no se envía: el backend lo calcula a 30 días */
export interface CreateBudgetPayload {
  clientId: string;
  aircraftId?: string | null;
  appointmentId?: string | null;
  description: string;
  amount: number;
  notes?: string | null;
}
