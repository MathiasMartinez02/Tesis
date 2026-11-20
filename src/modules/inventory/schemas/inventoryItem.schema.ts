import { z } from 'zod';
import { optionalText, optionalTextMax, requiredText } from '@/lib/zod';

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
    partNumber: requiredText(100),
    description: z.string().trim().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
    category: z.enum([
      'RepuestoMotor',
      'RepuestoCelula',
      'Consumible',
      'Herramienta',
      'Material',
      'Instrumento',
      'Avionico',
    ]),
    manufacturer: requiredText(150),
    location: requiredText(100),
    currentStock: z.number().min(0),
    minimumStock: z.number().min(0),
    maximumStock: optionalNumber(),
    unit: requiredText(30),
    unitCost: z.number().min(0),
    certificationRequired: z.boolean(),
    certificateNumber: optionalTextMax(100),
    expiryDate: optionalText(),
  })
  .refine(maximumStockRule.check, maximumStockRule.options)
  .refine((data) => !data.certificationRequired || !!data.certificateNumber, {
    message: 'El ítem requiere certificación: indicá el número de certificado',
    path: ['certificateNumber'],
  });

export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

export const inventoryItemEditSchema = z
  .object({
    description: z.string().trim().min(5, 'Mínimo 5 caracteres').max(500, 'Máximo 500 caracteres'),
    location: requiredText(100),
    minimumStock: z.number().min(0),
    maximumStock: optionalNumber(),
    unitCost: z.number().min(0),
    certificateNumber: optionalTextMax(100),
    expiryDate: optionalText(),
  })
  .refine(maximumStockRule.check, maximumStockRule.options);

export type InventoryItemEditFormData = z.infer<typeof inventoryItemEditSchema>;
