import type {
  WorkOrderStatus,
  WorkOrderPriority,
  WorkOrderType,
  AircraftStatus,
  AircraftCategory,
  InspectionStatus,
  InventoryStatus,
  InventoryCategory,
  ChecklistItemStatus,
  MovementType,
} from '@/types';

// ─── Work Orders ──────────────────────────────────────────────────────────────

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  Pendiente: 'Pendiente',
  EnProceso: 'En Proceso',
  EnInspeccion: 'En Inspección',
  Finalizada: 'Finalizada',
  Cancelada: 'Cancelada',
};

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  EnProceso: 'bg-blue-50 text-blue-700 border-blue-200',
  EnInspeccion: 'bg-purple-50 text-purple-700 border-purple-200',
  Finalizada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelada: 'bg-red-50 text-red-700 border-red-200',
};

export const WORK_ORDER_PRIORITY_LABELS: Record<WorkOrderPriority, string> = {
  Baja: 'Baja',
  Media: 'Media',
  Alta: 'Alta',
  Critica: 'Crítica',
};

export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  Baja: 'bg-gray-100 text-gray-600',
  Media: 'bg-yellow-100 text-yellow-700',
  Alta: 'bg-orange-100 text-orange-700',
  Critica: 'bg-red-100 text-red-700',
};

export const WORK_ORDER_TYPE_LABELS: Record<WorkOrderType, string> = {
  Inspeccion50h: 'Inspección 50 horas',
  Inspeccion100h: 'Inspección 100 horas',
  Inspeccion200h: 'Inspección 200 horas',
  InspeccionAnual: 'Inspección Anual',
  Reparacion: 'Reparación',
  Modificacion: 'Modificación',
  AdCumplimiento: 'AD Cumplimiento',
  Servicio: 'Servicio',
};

// ─── Aircraft ─────────────────────────────────────────────────────────────────

export const AIRCRAFT_STATUS_LABELS: Record<AircraftStatus, string> = {
  Operativa: 'Operativa',
  EnMantenimiento: 'En Mantenimiento',
  FueraDeServicio: 'Fuera de Servicio',
  EnInspeccion: 'En Inspección',
};

export const AIRCRAFT_STATUS_COLORS: Record<AircraftStatus, string> = {
  Operativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EnMantenimiento: 'bg-blue-50 text-blue-700 border-blue-200',
  FueraDeServicio: 'bg-red-50 text-red-700 border-red-200',
  EnInspeccion: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const AIRCRAFT_CATEGORY_LABELS: Record<AircraftCategory, string> = {
  Avion: 'Avión',
  Helicoptero: 'Helicóptero',
  Planeador: 'Planeador',
  Ultraliviano: 'Ultraliviano',
};

// ─── Inspections ──────────────────────────────────────────────────────────────

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  Pendiente: 'Pendiente',
  EnProceso: 'En Proceso',
  Completada: 'Completada',
  Aprobada: 'Aprobada',
  Rechazada: 'Rechazada',
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  EnProceso: 'bg-blue-50 text-blue-700 border-blue-200',
  Completada: 'bg-purple-50 text-purple-700 border-purple-200',
  Aprobada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rechazada: 'bg-red-50 text-red-700 border-red-200',
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  Disponible: 'Disponible',
  Reservado: 'Reservado',
  BajoStock: 'Bajo Stock',
  SinStock: 'Sin Stock',
  Vencido: 'Vencido',
};

export const INVENTORY_STATUS_COLORS: Record<InventoryStatus, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reservado: 'bg-blue-50 text-blue-700 border-blue-200',
  BajoStock: 'bg-amber-50 text-amber-700 border-amber-200',
  SinStock: 'bg-red-50 text-red-700 border-red-200',
  Vencido: 'bg-gray-50 text-gray-600 border-gray-200',
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  RepuestoMotor: 'Repuesto Motor',
  RepuestoCelula: 'Repuesto Célula',
  Consumible: 'Consumible',
  Herramienta: 'Herramienta',
  Material: 'Material',
  Instrumento: 'Instrumento',
  Avionico: 'Aviónico',
};

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  Entrada: 'Entrada',
  Salida: 'Salida',
  Reserva: 'Reserva',
  Devolucion: 'Devolución',
  Ajuste: 'Ajuste',
};

// ─── Checklist ────────────────────────────────────────────────────────────────

export const CHECKLIST_STATUS_LABELS: Record<ChecklistItemStatus, string> = {
  Pendiente: 'Pendiente',
  Conforme: 'Conforme',
  NoConforme: 'No Conforme',
  NA: 'N/A',
};

export const CHECKLIST_STATUS_COLORS: Record<ChecklistItemStatus, string> = {
  Pendiente: 'bg-gray-100 text-gray-600',
  Conforme: 'bg-emerald-100 text-emerald-700',
  NoConforme: 'bg-red-100 text-red-700',
  NA: 'bg-gray-100 text-gray-400',
};
