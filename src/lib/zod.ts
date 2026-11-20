import { z } from 'zod';

// Texto opcional: vacio o solo espacios pasa a undefined
export const optionalText = () =>
  z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined));
