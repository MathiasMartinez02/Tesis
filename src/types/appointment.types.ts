import type { WorkOrderType } from './workOrder.types';

/** Estados posibles de un turno a lo largo de su ciclo de vida */
export type AppointmentStatus = 'Solicitado' | 'Confirmado' | 'Cancelado' | 'ConvertidoOT';

/** AppointmentDto — lo que devuelve el listado y el detalle (GET /appointments, GET /appointments/{id}) */
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  aircraftId?: string | null;
  aircraftRegistration?: string | null;
  requestedType: WorkOrderType;
  scheduledDate: string;
  status: AppointmentStatus;
  notes?: string | null;
  convertedWorkOrderId?: string | null;
  createdAt: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

/** Payload para crear un turno (POST /appointments) */
export interface CreateAppointmentPayload {
  clientId: string;
  aircraftId?: string | null;
  aircraftRegistrationHint?: string | null;
  requestedType: WorkOrderType;
  scheduledDate: string;
  notes?: string | null;
}
