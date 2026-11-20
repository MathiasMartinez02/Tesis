import { z } from 'zod';
import { optionalText, optionalTextMax, requiredText } from '@/lib/zod';

export const budgetSchema = z.object({
  clientId: z.string().min(1, 'Seleccionar cliente'),
  aircraftId: optionalText(),
  description: requiredText(2000, 'La descripción es requerida'),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  notes: optionalTextMax(1000),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;
