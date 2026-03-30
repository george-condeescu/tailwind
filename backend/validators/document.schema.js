import { z } from 'zod';

export const documentCreateSchema = z.object({
  nr_inreg: z.string().max(20, {
    message: 'Numărul de înregistrare trebuie să aibă maximum 20 de caractere',
  }),
  nr_revizie: z
    .number()
    .int()
    .positive({
      message: 'Numărul de revizie trebuie să fie un număr întreg pozitiv',
    })
    .optional(),
  created_by_user_id: z.number().int().positive({
    message:
      'ID-ul utilizatorului care a creat trebuie să fie un număr întreg pozitiv',
  }),
  content_snapshot: z.string().min(1, {
    message: 'Snapshot-ul conținutului nu poate fi gol',
  }),
  note: z
    .string()
    .max(1000, {
      message: 'Notițele trebuie să aibă maximum 1000 de caractere',
    })
    .optional(),

  current_user_id: z.number().int().positive({
    message:
      'ID-ul utilizatorului care creează documentul trebuie să fie un număr întreg pozitiv',
  }),

  nr_revizie: z.number().int().positive({
    message: 'Numărul de revizie trebuie să fie un număr întreg pozitiv',
  }),
});

export const documentUpdateSchema = z.object({
  nr_inreg: z.string().max(20, {
    message: 'Numărul de înregistrare trebuie să aibă maximum 20 de caractere',
  }),
  nr_revizie: z.number().int().positive({
    message: 'Numărul de revizie trebuie să fie un număr întreg pozitiv',
  }),
  created_by_user_id: z.number().int().positive({
    message:
      'ID-ul utilizatorului care a editat trebuie să fie un număr întreg pozitiv',
  }),
  content_snapshot: z
    .string()
    .min(1, {
      message: 'Snapshot-ul conținutului nu poate fi gol',
    })
    .optional(),
  note: z
    .string()
    .max(1000, {
      message: 'Notițele trebuie să aibă maximum 1000 de caractere',
    })
    .optional(),

  current_user_id: z.number().int().positive({
    message:
      'ID-ul utilizatorului care editează documentul trebuie să fie un număr întreg pozitiv',
  }),
});
