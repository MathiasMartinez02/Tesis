import { z } from 'zod';
import { todayLocal } from './utils';

// Texto opcional: vacio o solo espacios pasa a undefined
export const optionalText = () =>
  z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined));

// Texto opcional con largo maximo; vacio pasa a undefined
export const optionalTextMax = (max: number) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((value) => (value?.trim() ? value : undefined));

// Texto obligatorio con largo maximo (mismos limites que la base)
export const requiredText = (max: number, message = 'Requerido') =>
  z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`);

// Indica si una fecha yyyy-MM-dd es hoy o posterior (hora local)
export const isTodayOrLater = (date: string): boolean => date >= todayLocal();
