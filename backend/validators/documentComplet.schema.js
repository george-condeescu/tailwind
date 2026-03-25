import { z } from 'zod';

export const documentCompletSchema = z.object({
  nr_inreg: z.string().max(20, {
    message: 'Numărul de înregistrare trebuie să aibă maximum 20 de caractere',
  }),
  user_id: z.number().int().positive({
    message: 'ID-ul utilizatorului trebuie să fie un număr întreg pozitiv',
  }),
  partener_id: z.number().int().positive({
    message: 'ID-ul partenerului trebuie să fie un număr întreg pozitiv',
  }),
  observatii: z
    .string()
    .max(255, {
      message: 'Observațiile trebuie să aibă maximum 255 de caractere',
    })
    .optional(),
  obiectul: z
    .string()
    .max(255, { message: 'Obiectul trebuie să aibă maximum 255 de caractere' }),
  cod_ssi: z
    .string()
    .max(50, { message: 'Codul SSI trebuie să aibă maximum 50 de caractere' })
    .optional(),
  cod_angajament: z
    .string()
    .max(50, {
      message: 'Codul de angajament trebuie să aibă maximum 50 de caractere',
    })
    .optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED'], {
    message:
      'Statusul trebuie să fie unul dintre următoarele: inregistrat, in_Document, finalizat',
  }),
});
