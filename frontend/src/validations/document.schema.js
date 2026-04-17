import { z } from 'zod';

export const documentCreateSchema = z.object({
  observatii: z.string().optional(),
  user_id: z.number().min(1, 'User ID este obligatoriu'),
  partener_id: z.number().min(1, 'Partener ID este obligatoriu'),
  obiectul: z.string().min(1, 'Obiectul este obligatoriu'),
  cod_ssi: z.string().optional(),
  cod_angajament: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']).default('DRAFT'),
});
