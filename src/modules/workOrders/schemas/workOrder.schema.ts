import { z } from 'zod';

export const workOrderSchema = z.object({
  type: z.enum([
    'Inspeccion50h', 'Inspeccion100h', 'Inspeccion200h',
    'InspeccionAnual', 'Reparacion', 'Modificacion', 'AdCumplimiento', 'Servicio'
  ]),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Critica']),
  aircraftId: z.string().min(1, 'Seleccionar aeronave'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  estimatedHours: z.number().min(0.5, 'Mínimo 0.5 horas').max(999),
  intakeDate: z.string().min(1, 'Fecha requerida'),
  estimatedEndDate: z.string().min(1, 'Fecha requerida'),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export const workOrderEditSchema = workOrderSchema.omit({ type: true, aircraftId: true });

export type WorkOrderEditFormData = z.infer<typeof workOrderEditSchema>;

export const addTaskSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  estimatedHours: z.coerce.number().positive('Debe ser mayor a cero'),
  requiresInspection: z.boolean().default(false),
});

export type AddTaskFormData = z.infer<typeof addTaskSchema>;

export const addMaterialSchema = z.object({
  partNumber: z.string().min(1, 'Número de parte requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  quantity: z.coerce.number().positive('Debe ser mayor a cero'),
  unit: z.string().min(1, 'Unidad requerida'),
});

export type AddMaterialFormData = z.infer<typeof addMaterialSchema>;
