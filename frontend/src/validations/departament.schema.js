import { z } from 'zod';

export const departamentSchema = z.object({
  name: z.string().min(5, 'Minim 5 caractere.'),
  type: z.enum(['CONDUCERE', 'DIRECTIE', 'SERVICIU', 'COMPARTIMENT']),
  parent_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().min(0).nullable()
  ),
  code: z.string().min(2, 'Minim 2 caractere.'),
  is_active: z.coerce.number().int().min(0).max(1),
});
