import { z } from 'zod';
import { optionalText } from '@/lib/zod';

// Numero opcional que acepta el NaN de un input vacio
const optionalNumber = () =>
  z.preprocess(
    (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
    z.number().min(0).optional()
  );

const maximumStockRule = {
  check: (data: { minimumStock: number; maximumStock?: number }) =>
    data.maximumStock === undefined || data.maximumStock > data.minimumStock,
  options: { message: 'El stock máximo debe ser mayor al stock mínimo', path: ['maximumStock'] },
};

export const inventoryItemSchema = z
  .object({
    partNumber: z.string().min(1, 'Requerido'),
    description: z.string().min(5, 'Mínimo 5 caracteres'),
    category: z.enum([
      'RepuestoMotor',
      'RepuestoCelula',
      'Consumible',
      'Herramienta',
      'Material',
      'Instrumento',
      'Avionico',
    ]),
    manufacturer: z.string().min(1, 'Requerido'),
    location: z.string().min(1, 'Requerido'),
    currentStock: z.number().min(0),
    minimumStock: z.number().min(0),
    maximumStock: optionalNumber(),
    unit: z.string().min(1, 'Requerido'),
    unitCost: z.number().min(0),
    certificationRequired: z.boolean(),
    certificateNumber: optionalText(),
    expiryDate: optionalText(),
  })
  .refine(maximumStockRule.check, maximumStockRule.options);

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export const inventoryItemEditSchema = z
  .object({
    description: z.string().min(5, 'Mínimo 5 caracteres'),
    location: z.string().min(1, 'Requerido'),
    minimumStock: z.number().min(0),
    maximumStock: optionalNumber(),
    unitCost: z.number().min(0),
    certificateNumber: optionalText(),
    expiryDate: optionalText(),
  })
  .refine(maximumStockRule.check, maximumStockRule.options);

export type InventoryItemEditFormData = z.infer<typeof inventoryItemEditSchema>;
