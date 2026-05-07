import type {
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderType,
  AircraftStatus,
  InspectionStatus,
  InspectionType,
  InventoryItemStatus,
  ChecklistItemStatus,
} from '@/types';

// ─── Work Orders ──────────────────────────────────────────────────────────────

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  en_inspeccion: 'En Inspección',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  en_proceso: 'bg-blue-50 text-blue-700 border-blue-200',
  en_inspeccion: 'bg-purple-50 text-purple-700 border-purple-200',
  finalizada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelada: 'bg-red-50 text-red-700 border-red-200',
};

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
};

export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  baja: 'bg-gray-100 text-gray-600',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
};

export const WORK_ORDER_TYPE_LABELS: Record<WorkOrderType, string> = {
  inspeccion_50h: 'Inspección 50 horas',
  inspeccion_100h: 'Inspección 100 horas',
  inspeccion_200h: 'Inspección 200 horas',
  inspeccion_anual: 'Inspección Anual',
  reparacion: 'Reparación',
  modificacion: 'Modificación',
  ad_cumplimiento: 'AD Cumplimiento',
  servicio: 'Servicio',
};

// ─── Aircraft ─────────────────────────────────────────────────────────────────

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
  operativa: 'Operativa',
  en_mantenimiento: 'En Mantenimiento',
  fuera_de_servicio: 'Fuera de Servicio',
  en_inspeccion: 'En Inspección',
};

export const AIRCRAFT_STATUS_COLORS: Record<AircraftStatus, string> = {
  operativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  en_mantenimiento: 'bg-blue-50 text-blue-700 border-blue-200',
  fuera_de_servicio: 'bg-red-50 text-red-700 border-red-200',
  en_inspeccion: 'bg-purple-50 text-purple-700 border-purple-200',
};

// ─── Inspections ──────────────────────────────────────────────────────────────

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  programada: 'Programada',
  en_curso: 'En Curso',
  pendiente_aprobacion: 'Pend. Aprobación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  programada: 'bg-blue-50 text-blue-700 border-blue-200',
  en_curso: 'bg-amber-50 text-amber-700 border-amber-200',
  pendiente_aprobacion: 'bg-purple-50 text-purple-700 border-purple-200',
  aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rechazada: 'bg-red-50 text-red-700 border-red-200',
  vencida: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  inspeccion_50h: '50 Horas',
  inspeccion_100h: '100 Horas',
  inspeccion_200h: '200 Horas',
  inspeccion_anual: 'Inspección Anual',
  preflight: 'Pre-Vuelo',
  ad_cumplimiento: 'AD Cumplimiento',
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const INVENTORY_STATUS_LABELS: Record<InventoryItemStatus, string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  bajo_stock: 'Bajo Stock',
  sin_stock: 'Sin Stock',
  vencido: 'Vencido',
};

export const INVENTORY_STATUS_COLORS: Record<InventoryItemStatus, string> = {
  disponible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  reservado: 'bg-blue-50 text-blue-700 border-blue-200',
  bajo_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  sin_stock: 'bg-red-50 text-red-700 border-red-200',
  vencido: 'bg-gray-50 text-gray-600 border-gray-200',
};

// ─── Checklist ────────────────────────────────────────────────────────────────

export const CHECKLIST_STATUS_LABELS: Record<ChecklistItemStatus, string> = {
  pendiente: 'Pendiente',
  conforme: 'Conforme',
  no_conforme: 'No Conforme',
  na: 'N/A',
};

export const CHECKLIST_STATUS_COLORS: Record<ChecklistItemStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-600',
  conforme: 'bg-emerald-100 text-emerald-700',
  no_conforme: 'bg-red-100 text-red-700',
  na: 'bg-gray-100 text-gray-400',
};
