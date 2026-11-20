import { z } from 'zod';
import { optionalText, requiredText } from '@/lib/zod';

export const documentFormSchema = z.object({
  name: requiredText(200),
  type: requiredText(100),
  fileUrl: requiredText(500),
  expiryDate: optionalText(),
});

export type DocumentFormData = z.infer<typeof documentFormSchema>;
