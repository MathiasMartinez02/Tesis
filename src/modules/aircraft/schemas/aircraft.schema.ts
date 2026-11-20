import { z } from 'zod';
import { isTodayOrLater, optionalTextMax, requiredText } from '@/lib/zod';
import { todayLocal } from '@/lib/utils';

const MAX_YEAR = new Date().getFullYear() + 5;

const aircraftBaseSchema = z.object({
  registration: z
    .string()
    .min(1, 'Requerido')
    .regex(/^[A-Za-z]{2}-[A-Za-z]{3,4}$/, 'Formato: XX-XXX o XX-XXXX (ej. LV-ABC)'),
  manufacturer: requiredText(100),
  model: requiredText(100),
  year: z.number().min(1900, 'Año inválido').max(MAX_YEAR, `El año no puede superar ${MAX_YEAR}`),
  category: z.enum(['Avion', 'Helicoptero', 'Planeador', 'Ultraliviano']),
  serialNumber: requiredText(100),
  engineModel: requiredText(100),
  engineSerialNumber: requiredText(100),
  clientId: z.string().min(1, 'Seleccionar cliente'),
  totalFlightHours: z.number().min(0),
  totalLandings: z.number().min(0),
  nextInspectionDue: z.string().min(1, 'Requerido'),
  nextInspectionHours: z.number().min(0),
  certificateExpiry: z.string().min(1, 'Requerido'),
});

export const aircraftSchema = aircraftBaseSchema.extend({
  certificateExpiry: z
    .string()
    .min(1, 'Requerido')
    .refine(isTodayOrLater, 'El certificado no puede estar vencido'),
});

export type AircraftFormData = z.infer<typeof aircraftSchema>;

export const aircraftEditSchema = aircraftBaseSchema.omit({ registration: true, clientId: true });

export type AircraftEditFormData = z.infer<typeof aircraftEditSchema>;

export const flightRecordSchema = z.object({
  date: z
    .string()
    .min(1, 'Fecha requerida')
    .refine((value) => value <= todayLocal(), 'La fecha del vuelo no puede ser futura'),
  duration: z.coerce.number().positive('La duración debe ser mayor a cero').max(24, 'Máximo 24 horas'),
  landings: z.coerce.number().int('Debe ser un número entero').min(0, 'No puede ser negativo'),
  pilot: requiredText(200),
  origin: requiredText(100),
  destination: requiredText(100),
  notes: optionalTextMax(500),
});

export type FlightRecordFormData = z.infer<typeof flightRecordSchema>;
