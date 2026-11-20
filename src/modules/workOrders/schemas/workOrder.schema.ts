import { z } from 'zod';
import { isTodayOrLater, requiredText } from '@/lib/zod';

const END_BEFORE_INTAKE = {
  message: 'La fecha estimada de finalización no puede ser anterior a la de ingreso',
  path: ['estimatedEndDate'],
};

const workOrderBaseSchema = z.object({
  type: z.enum([
    'Inspeccion50h', 'Inspeccion100h', 'Inspeccion200h',
    'InspeccionAnual', 'Reparacion', 'Modificacion', 'AdCumplimiento', 'Servicio'
  ]),
  priority: z.enum(['Baja', 'Media', 'Alta', 'Critica']),
  aircraftId: z.string().min(1, 'Seleccionar aeronave'),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  estimatedHours: z.number().min(0.5, 'Mínimo 0.5 horas').max(999),
  intakeDate: z.string().min(1, 'Fecha requerida'),
  estimatedEndDate: z.string().min(1, 'Fecha requerida'),
});

export const workOrderSchema = workOrderBaseSchema
  .refine((data) => data.estimatedEndDate >= data.intakeDate, END_BEFORE_INTAKE)
  .refine((data) => isTodayOrLater(data.estimatedEndDate), {
    message: 'La fecha estimada de finalización no puede ser pasada',
    path: ['estimatedEndDate'],
  });

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export const workOrderEditSchema = workOrderBaseSchema
  .omit({ type: true, aircraftId: true })
  .refine((data) => data.estimatedEndDate >= data.intakeDate, END_BEFORE_INTAKE);

export type WorkOrderEditFormData = z.infer<typeof workOrderEditSchema>;

export const addTaskSchema = z.object({
  title: requiredText(300, 'Título requerido'),
  description: requiredText(2000, 'Descripción requerida'),
  estimatedHours: z.coerce.number().positive('Debe ser mayor a cero'),
  requiresInspection: z.boolean().default(false),
});

export type AddTaskFormData = z.infer<typeof addTaskSchema>;

export const addMaterialSchema = z.object({
  partNumber: requiredText(100, 'Número de parte requerido'),
  description: requiredText(500, 'Descripción requerida'),
  quantity: z.coerce.number().positive('Debe ser mayor a cero'),
  unit: requiredText(30, 'Unidad requerida'),
});

export type AddMaterialFormData = z.infer<typeof addMaterialSchema>;
