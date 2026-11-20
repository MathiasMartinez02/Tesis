import { z } from 'zod';
import { optionalText } from '@/lib/zod';

export const technicalDocumentSchema = z.object({
  type: z.string().min(1, 'Requerido'),
  title: z.string().min(1, 'Requerido'),
  fileUrl: z.string().min(1, 'Requerido'),
  referenceCode: optionalText(),
  description: optionalText(),
  issueDate: optionalText(),
  expiryDate: optionalText(),
});

export type TechnicalDocumentFormData = z.infer<typeof technicalDocumentSchema>;
