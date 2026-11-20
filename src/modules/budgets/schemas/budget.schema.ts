import { z } from 'zod';
import { optionalText } from '@/lib/zod';

export const budgetSchema = z.object({
  clientId: z.string().min(1, 'Seleccionar cliente'),
  aircraftId: optionalText(),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  notes: optionalText(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
