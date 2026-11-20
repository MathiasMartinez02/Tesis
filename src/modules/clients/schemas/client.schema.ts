import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  businessName: z.string().min(2, 'Mínimo 2 caracteres'),
  taxId: z
    .string()
    .regex(/^\d{2}-\d{8}-\d$/, 'Formato CUIT: XX-XXXXXXXX-X'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  address: z.string().min(5, 'Requerido'),
  city: z.string().min(2, 'Requerido'),
  province: z.string().min(2, 'Requerido'),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
