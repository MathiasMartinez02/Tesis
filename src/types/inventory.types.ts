export type InventoryCategory =
  | 'RepuestoMotor'
  | 'RepuestoCelula'
  | 'Consumible'
  | 'Herramienta'
  | 'Material'
  | 'Instrumento'
  | 'Avionico';

export type InventoryStatus = 'Disponible' | 'Reservado' | 'BajoStock' | 'SinStock' | 'Vencido';

export type MovementType = 'Entrada' | 'Salida' | 'Reserva' | 'Devolucion' | 'Ajuste';

/** InventoryItemDto */
export interface InventoryItem {
  id: string;
  partNumber: string;
  description: string;
  category: InventoryCategory;
  manufacturer: string;
  location: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitCost: number;
  status: InventoryStatus;
  expiryDate?: string;
  certificationRequired: boolean;
  certificateNumber?: string;
  lastMovementDate?: string;
  createdAt: string;
}

/** InventoryMovementDto */
export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  workOrderId?: string;
  reason: string;
  performedById: string;
  performedByName: string;
  performedAt: string;
}

export interface InventoryFilters {
  category?: InventoryCategory;
  status?: InventoryStatus;
  search?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface CreateInventoryItemPayload {
  partNumber: string;
  description: string;
  category: InventoryCategory;
  manufacturer: string;
  location: string;
  minimumStock: number;
  unit: string;
  unitCost: number;
  certificationRequired?: boolean;
  expiryDate?: string;
  altPartNumbers?: string;
}

export interface CreateInventoryMovementPayload {
  type: MovementType;
  quantity: number;
  workOrderId?: string;
  reason: string;
}

/** Payload de edicion de un item de inventario (PUT /inventory/{id}) */
export interface UpdateInventoryItemPayload {
  description: string;
  location: string;
  minimumStock: number;
  unitCost: number;
  certificateNumber?: string;
  expiryDate?: string;
}

/** Alias de compatibilidad */
export type InventoryItemCategory = InventoryCategory;
export type InventoryItemStatus = InventoryStatus;
