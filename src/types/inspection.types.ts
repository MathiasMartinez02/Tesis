export type InspectionType =
  | 'inspeccion_50h'
  | 'inspeccion_100h'
  | 'inspeccion_200h'
  | 'inspeccion_anual'
  | 'preflight'
  | 'ad_cumplimiento';

export type InspectionStatus =
  | 'programada'
  | 'en_curso'
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'rechazada'
  | 'vencida';

export type ChecklistItemStatus = 'pendiente' | 'conforme' | 'no_conforme' | 'na';

export interface Inspection {
  id: string;
  workOrderId: string;
  workOrderNumber: string;
  type: InspectionType;
  status: InspectionStatus;
  aircraftId: string;
  aircraftRegistration: string;
  aircraftModel: string;
  aircraftHours: number;
  inspectorId?: string;
  inspectorName?: string;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  approvedById?: string;
  approvedByName?: string;
  rejectionReason?: string;
  overallResult?: 'aprobado' | 'rechazado' | 'con_observaciones';
  observations?: string;
  checklist: ChecklistSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistSection {
  id: string;
  inspectionId: string;
  title: string;
  orderIndex: number;
  items: ChecklistItem[];
  isCompleted: boolean;
}

export interface ChecklistItem {
  id: string;
  sectionId: string;
  code: string;
  description: string;
  reference?: string; // AMM reference
  orderIndex: number;
  status: ChecklistItemStatus;
  observations?: string;
  checkedById?: string;
  checkedByName?: string;
  checkedAt?: string;
  requiresPhoto: boolean;
  photoUrl?: string;
}

export interface InspectionFilters {
  status?: InspectionStatus;
  type?: InspectionType;
  inspectorId?: string;
  aircraftId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
