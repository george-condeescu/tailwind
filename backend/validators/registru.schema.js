import { coerce, z } from 'zod';

const createRegistruSchema = z.object({
  nr_inreg: z.string().min(1, 'Numărul de înregistrare este obligatoriu'),
  observatii: z.string().min(1, 'Observațiile sunt obligatorii'),
  user_id: coerce
    .number()
    .int()
    .positive('ID-ul utilizatorului trebuie să fie un număr întreg pozitiv'),
  partener_id: coerce
    .number()
    .int()
    .positive('ID-ul partenerului trebuie să fie un număr întreg pozitiv'),
  obiectul: z.string().min(1, 'Obiectul este obligatoriu'),
  cod_ssi: z.string().min(1, 'Codul SSI este obligatoriu'),
  cod_angajament: z.string().min(1, 'Codul de angajament este obligatoriu'),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']).default('DRAFT'),
});

const updateRegistruSchema = z.object({
  nr_inreg: z.string().min(1, 'Numărul de înregistrare este obligatoriu'),
  observatii: z.string().min(1, 'Observațiile sunt obligatorii').optional(),
  user_id: coerce
    .number()
    .int()
    .positive('ID-ul utilizatorului trebuie să fie un număr întreg pozitiv')
    .optional(),
  partener_id: coerce
    .number()
    .int()
    .positive('ID-ul partenerului trebuie să fie un număr întreg pozitiv')
    .optional(),
  obiectul: z.string().min(1, 'Obiectul este obligatoriu').optional(),
  cod_ssi: z.string().min(1, 'Codul SSI este obligatoriu').optional(),
  cod_angajament: z
    .string()
    .min(1, 'Codul de angajament este obligatoriu')
    .optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().default(() => new Date()),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']).default('DRAFT'),
});

export { createRegistruSchema, updateRegistruSchema };
