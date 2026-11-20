import { z } from 'zod';
import { optionalText } from '@/lib/zod';

export const movementSchema = z.object({
  type: z.enum(['Entrada', 'Salida', 'Reserva', 'Devolucion', 'Ajuste']),
  quantity: z.number().min(1, 'Debe ser mayor a 0'),
  reason: z.string().min(3, 'Mínimo 3 caracteres'),
  workOrderId: optionalText(),
});

export type MovementFormData = z.infer<typeof movementSchema>;
