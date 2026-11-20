import { z } from 'zod';
import { optionalText, optionalTextMax, requiredText } from '@/lib/zod';

export const userFormSchema = z
  .object({
    email: z.string().min(1, 'El email es requerido').email('Email inválido').max(256, 'Máximo 256 caracteres'),
    password: z.string().max(100, 'Máximo 100 caracteres').optional(),
    firstName: requiredText(100, 'El nombre es requerido'),
    lastName: requiredText(100, 'El apellido es requerido'),
    role: z.enum([
      'Gerente',
      'OficinaTecnica',
      'Inspector',
      'JefeTaller',
      'Mecanico',
      'Panol',
      'Administracion',
    ]),
    licenseNumber: optionalTextMax(50),
    licenseExpiry: optionalText(),
    phone: optionalTextMax(30),
  })
  .refine((data) => data.password === undefined || data.password.length === 0 || data.password.length >= 8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
    path: ['password'],
  });

export type UserFormData = z.infer<typeof userFormSchema>;
