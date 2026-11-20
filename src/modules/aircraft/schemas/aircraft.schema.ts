import { z } from 'zod';
import { optionalText } from '@/lib/zod';

export const aircraftSchema = z.object({
  registration: z
    .string()
    .min(1, 'Requerido')
    .regex(/^LV-[A-Z]{3}$/, 'Formato: LV-XXX (ej. LV-ABC)'),
  manufacturer: z.string().min(1, 'Requerido'),
  model: z.string().min(1, 'Requerido'),
  year: z.number().min(1900).max(new Date().getFullYear()),
  category: z.enum(['Avion', 'Helicoptero', 'Planeador', 'Ultraliviano']),
  serialNumber: z.string().min(1, 'Requerido'),
  engineModel: z.string().min(1, 'Requerido'),
  engineSerialNumber: z.string().min(1, 'Requerido'),
  clientId: z.string().min(1, 'Seleccionar cliente'),
  totalFlightHours: z.number().min(0),
  totalLandings: z.number().min(0),
  nextInspectionDue: z.string().min(1, 'Requerido'),
  nextInspectionHours: z.number().min(0),
  certificateExpiry: z.string().min(1, 'Requerido'),
});

export type AircraftFormData = z.infer<typeof aircraftSchema>;

export const aircraftEditSchema = aircraftSchema.omit({ registration: true, clientId: true });

export type AircraftEditFormData = z.infer<typeof aircraftEditSchema>;

export const aircraftDocumentSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  type: z.string().min(1, 'Requerido'),
  fileUrl: z.string().min(1, 'Requerido'),
  expiryDate: optionalText(),
});

export type AircraftDocumentFormData = z.infer<typeof aircraftDocumentSchema>;
