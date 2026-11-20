import { z } from 'zod';

export const appointmentSchema = z
  .object({
    clientId: z.string().min(1, 'Seleccionar cliente'),
    useRegisteredAircraft: z.boolean(),
    aircraftId: z.string().optional(),
    aircraftRegistrationHint: z.string().optional(),
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
    scheduledDate: z.string().min(1, 'Fecha requerida'),
    notes: z.string().optional(),
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
