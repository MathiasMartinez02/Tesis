import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Requerido'),
  password: z.string().min(1, 'Requerido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
