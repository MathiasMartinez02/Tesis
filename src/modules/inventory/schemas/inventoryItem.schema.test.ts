import { describe, expect, it } from 'vitest';
import { inventoryItemEditSchema, inventoryItemSchema } from './inventoryItem.schema';

const validItem = {
  partNumber: 'PN-001',
  description: 'Filtro de aceite',
  category: 'Consumible',
  manufacturer: 'Lycoming',
  location: 'Estante A1',
  currentStock: 10,
  minimumStock: 2,
  unit: 'unidad',
  unitCost: 1500,
  certificationRequired: false,
};

describe('inventoryItemSchema', () => {
  it('acepta un item valido sin stock maximo', () => {
    expect(inventoryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it('trata el NaN de un input vacio como stock maximo no informado', () => {
    const result = inventoryItemSchema.parse({ ...validItem, maximumStock: Number.NaN });
    expect(result.maximumStock).toBeUndefined();
  });

  it('rechaza un stock maximo menor o igual al minimo', () => {
    const result = inventoryItemSchema.safeParse({ ...validItem, maximumStock: 2 });
    expect(result.success).toBe(false);
  });

  it('no manda fecha de vencimiento ni certificado vacios al backend', () => {
    const result = inventoryItemSchema.parse({ ...validItem, expiryDate: '', certificateNumber: '' });

    expect(result.expiryDate).toBeUndefined();
    expect(result.certificateNumber).toBeUndefined();
  });

  it('rechaza una categoria que no existe en el backend', () => {
    expect(inventoryItemSchema.safeParse({ ...validItem, category: 'repuesto_motor' }).success).toBe(false);
  });
});

describe('inventoryItemEditSchema', () => {
  it('no manda fecha de vencimiento vacia al editar', () => {
    const result = inventoryItemEditSchema.parse({
      description: 'Filtro de aceite',
      location: 'Estante A1',
      minimumStock: 2,
      unitCost: 1500,
      expiryDate: '',
    });

    expect(result.expiryDate).toBeUndefined();
  });

  it('aplica la misma regla de stock maximo', () => {
    const result = inventoryItemEditSchema.safeParse({
      description: 'Filtro de aceite',
      location: 'Estante A1',
      minimumStock: 5,
      maximumStock: 3,
      unitCost: 1500,
    });
    expect(result.success).toBe(false);
  });
});
