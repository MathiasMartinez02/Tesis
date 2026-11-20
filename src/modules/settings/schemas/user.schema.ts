import { z } from 'zod';
import { optionalText } from '@/lib/zod';

export const userFormSchema = z
  .object({
    email: z.string().min(1, 'El email es requerido').email('Email invalido'),
    password: z.string().optional(),
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    role: z.enum([
      'Gerente',
      'OficinaTecnica',
      'Inspector',
      'JefeTaller',
      'Mecanico',
      'Panol',
      'Administracion',
    ]),
    licenseNumber: optionalText(),
    licenseExpiry: optionalText(),
    phone: optionalText(),
  })
  .refine((data) => data.password === undefined || data.password.length === 0 || data.password.length >= 8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
    path: ['password'],
  });

export type UserFormData = z.infer<typeof userFormSchema>;
