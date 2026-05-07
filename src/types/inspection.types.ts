export type InspectionStatus =
  | 'Pendiente'
  | 'EnProceso'
  | 'Completada'
  | 'Aprobada'
  | 'Rechazada';

export type ChecklistItemStatus = 'Pendiente' | 'Conforme' | 'NoConforme' | 'NA';

/** InspectionDto — lo que devuelve el listado (GET /inspections) */
export interface Inspection {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  type: string;
  status: InspectionStatus;
  aircraftId: string;
  aircraftRegistration: string;
  aircraftHours: number;
  inspectorId?: string;
  inspectorName?: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  overallResult?: string;
  observations?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  code: string;
  description: string;
  reference?: string;
  orderIndex: number;
  status: ChecklistItemStatus;
  observations?: string;
  checkedById?: string;
  checkedAt?: string;
  requiresPhoto: boolean;
  photoUrl?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  orderIndex: number;
  items: ChecklistItem[];
}

/** InspectionDetailDto — lo que devuelve GET /inspections/{id} */
export interface InspectionDetail extends Inspection {
  checklistSections: ChecklistSection[];
}

export interface InspectionFilters {
  status?: InspectionStatus;
  type?: string;
  inspectorId?: string;
  aircraftId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
