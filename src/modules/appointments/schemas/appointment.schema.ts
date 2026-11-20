import { z } from 'zod';

export const appointmentSchema = z
  .object({
    clientId: z.string().min(1, 'Seleccionar cliente'),
    useRegisteredAircraft: z.boolean(),
    aircraftId: z.string().optional(),
    aircraftRegistrationHint: z.string().max(20, 'Máximo 20 caracteres').optional(),
    requestedType: z.enum([
      'Inspeccion50h',
      'Inspeccion100h',
      'Inspeccion200h',
      'InspeccionAnual',
      'Reparacion',
      'Modificacion',
      'AdCumplimiento',
      'Servicio',
    ]),
    scheduledDate: z
      .string()
      .min(1, 'Fecha requerida')
      .refine((value) => new Date(value) > new Date(), 'La fecha y hora del turno deben ser futuras'),
    notes: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.useRegisteredAircraft && !data.aircraftId) {
      ctx.addIssue({ code: 'custom', path: ['aircraftId'], message: 'Seleccionar aeronave' });
    }
    if (!data.useRegisteredAircraft && !data.aircraftRegistrationHint?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['aircraftRegistrationHint'], message: 'Matrícula requerida' });
    }
  });

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
