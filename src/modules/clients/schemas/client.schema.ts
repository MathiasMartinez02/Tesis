import { z } from 'zod';
import { requiredText } from '@/lib/zod';

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres'),
  businessName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres'),
  taxId: z
    .string()
    .regex(/^\d{2}-\d{8}-\d$/, 'Formato CUIT: XX-XXXXXXXX-X'),
  email: z.string().email('Email inválido').max(256, 'Máximo 256 caracteres'),
  phone: z.string().min(7, 'Teléfono inválido').max(30, 'Máximo 30 caracteres'),
  address: z.string().min(5, 'Requerido').max(300, 'Máximo 300 caracteres'),
  city: requiredText(100),
  province: requiredText(100),
  contactPerson: z.string().max(150, 'Máximo 150 caracteres').optional(),
  contactPhone: z.string().max(30, 'Máximo 30 caracteres').optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
