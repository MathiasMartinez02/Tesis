export type InventoryItemCategory =
  | 'repuesto_motor'
  | 'repuesto_celula'
  | 'consumible'
  | 'herramienta'
  | 'material'
  | 'instrumento'
  | 'avionico';

export type InventoryItemStatus = 'disponible' | 'reservado' | 'bajo_stock' | 'sin_stock' | 'vencido';

export interface InventoryItem {
  id: string;
  partNumber: string;
  altPartNumbers?: string[];
  description: string;
  category: InventoryItemCategory;
  manufacturer: string;
  location: string; // Ej: "Estante A-3"
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  status: InventoryItemStatus;
  expiryDate?: string;
  certificationRequired: boolean;
  certificateNumber?: string;
  lastMovementDate: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'entrada' | 'salida' | 'reserva' | 'devolucion' | 'ajuste';

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemPartNumber: string;
  itemDescription: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  workOrderId?: string;
  workOrderNumber?: string;
  reason: string;
  performedById: string;
  performedByName: string;
  performedAt: string;
  approvedById?: string;
  approvedByName?: string;
}

export interface InventoryFilters {
  category?: InventoryItemCategory;
  status?: InventoryItemStatus;
  search?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}
