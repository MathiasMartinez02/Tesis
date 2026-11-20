import { z } from 'zod';
import { optionalText, optionalTextMax, requiredText } from '@/lib/zod';

export const technicalDocumentSchema = z
  .object({
    type: z.string().min(1, 'Requerido'),
    title: requiredText(200),
    fileUrl: requiredText(500),
    referenceCode: optionalTextMax(100),
    description: optionalTextMax(1000),
    issueDate: optionalText(),
    expiryDate: optionalText(),
  })
  .refine((data) => !data.issueDate || !data.expiryDate || data.expiryDate >= data.issueDate, {
    message: 'El vencimiento no puede ser anterior a la emisión',
    path: ['expiryDate'],
  });

export type TechnicalDocumentFormData = z.infer<typeof technicalDocumentSchema>;
