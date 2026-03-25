import { z } from 'zod';

export const documentCreateSchema = z.object({
  observatii: z.string().optional(),
  user_id: z.number().min(1, 'User ID este obligatoriu'),
  partener_id: z.number().min(1, 'Partener ID este obligatoriu'),
  obiectul: z.string().min(1, 'Obiectul este obligatoriu'),
  cod_ssi: z.string().min(1, 'Cod SSI este obligatoriu'),
  cod_angajament: z.string().min(1, 'Cod Angajament este obligatoriu'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']).default('DRAFT'),
});
