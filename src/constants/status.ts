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
  AppointmentStatus,
  TechnicalDocumentType,
  BudgetStatus,
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

// Etiquetas de los tipos de inspección usados al programar una nueva inspección
export const INSPECTION_TYPE_LABELS: Record<string, string> = {
  inspeccion_50h: 'Inspección 50h',
  inspeccion_100h: 'Inspección 100h',
  inspeccion_200h: 'Inspección 200h',
  inspeccion_anual: 'Inspección Anual',
  inspeccion_especial: 'Inspección Especial',
};

// ─── Inventory ────────────────────────────────────────────────────────────────

// MODIFICADO: se agrega la etiqueta de 'SobreStock' (stock actual por encima del maximo definido)
// ANTERIOR: solo incluia Disponible, Reservado, BajoStock, SinStock, Vencido
export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  Disponible: 'Disponible',
  Reservado: 'Reservado',
  BajoStock: 'Bajo Stock',
  SinStock: 'Sin Stock',
  Vencido: 'Vencido',
  SobreStock: 'Sobre-stock',
};

// MODIFICADO: se agrega el color de alerta para 'SobreStock', consistente con el usado para BajoStock
// ANTERIOR: solo incluia Disponible, Reservado, BajoStock, SinStock, Vencido
export const INVENTORY_STATUS_COLORS: Record<InventoryStatus, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reservado: 'bg-blue-50 text-blue-700 border-blue-200',
  BajoStock: 'bg-amber-50 text-amber-700 border-amber-200',
  SinStock: 'bg-red-50 text-red-700 border-red-200',
  Vencido: 'bg-gray-50 text-gray-600 border-gray-200',
  SobreStock: 'bg-amber-50 text-amber-700 border-amber-200',
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

// ─── Appointments (Turnos) ─────────────────────────────────────────────────────

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  Solicitado: 'Solicitado',
  Confirmado: 'Confirmado',
  Cancelado: 'Cancelado',
  ConvertidoOT: 'Convertido a OT',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  Solicitado: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmado: 'bg-blue-50 text-blue-700 border-blue-200',
  Cancelado: 'bg-red-50 text-red-700 border-red-200',
  ConvertidoOT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ─── Documentación técnica ──────────────────────────────────────────────────────

export const TECHNICAL_DOCUMENT_TYPE_LABELS: Record<TechnicalDocumentType, string> = {
  Manual: 'Manual',
  BoletinServicio: 'Boletín de Servicio',
  DirectivaAD: 'Directiva AD',
  Certificado: 'Certificado',
  Otro: 'Otro',
};

export const TECHNICAL_DOCUMENT_TYPE_COLORS: Record<TechnicalDocumentType, string> = {
  Manual: 'bg-blue-50 text-blue-700 border-blue-200',
  BoletinServicio: 'bg-purple-50 text-purple-700 border-purple-200',
  DirectivaAD: 'bg-red-50 text-red-700 border-red-200',
  Certificado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Otro: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Presupuestos (Fase 6, MVP Administrativo) ─────────────────────────────────

export const BUDGET_STATUS_LABELS: Record<BudgetStatus, string> = {
  Pendiente: 'Pendiente',
  Aceptado: 'Aceptado',
  Rechazado: 'Rechazado',
  Vencido: 'Vencido',
};

export const BUDGET_STATUS_COLORS: Record<BudgetStatus, string> = {
  Pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  Aceptado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rechazado: 'bg-red-50 text-red-700 border-red-200',
  Vencido: 'bg-gray-50 text-gray-600 border-gray-200',
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
