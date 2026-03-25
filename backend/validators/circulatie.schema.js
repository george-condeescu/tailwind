import { z } from 'zod';

export const circulatieSchema = z.object({
  document_id: z.number().int().positive({
    message: 'ID-ul documentului trebuie să fie un număr întreg pozitiv',
  }),
  action: z.enum(['SEND', 'RECEIVE', 'RETURN', 'CLOSE', 'CANCEL', 'DRAFT']),
  from_user_id: z.number().int().positive({
    message:
      'ID-ul utilizatorului care trimite trebuie să fie un număr întreg pozitiv',
  }),
  to_user_id: z
    .number()
    .int()
    .positive({
      message:
        'ID-ul utilizatorului care primește trebuie să fie un număr întreg pozitiv',
    })
    .nullable()
    .optional(),
  note: z
    .string()
    .max(1000, {
      message: 'Notițele trebuie să aibă maximum 1000 de caractere',
    })
    .optional(),
  data_intrare: z.date(),
  data_iesire: z.date().nullable().optional(),
  citit: z.date().nullable().optional(),
});
