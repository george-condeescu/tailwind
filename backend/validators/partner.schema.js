import { z } from 'zod';

export const partnerSchema = z.object({
  denumire: z.string().min(3, 'Minim 3 caractere.'),
  adresa: z.string().min(5, 'Minim 5 caractere.').nullable().optional(),
  cui: z.string().min(5, 'Minim 5 caractere.').nullable().optional(),
  reg_com: z.string().min(5, 'Minim 5 caractere.').nullable().optional(),
  tara: z.string().min(3, 'Minim 3 caractere.').nullable().optional(),
  judet: z.string().min(3, 'Minim 3 caractere.').nullable().optional(),
  localitate: z.string().min(3, 'Minim 3 caractere.').nullable().optional(),
  telefon: z
    .string()
    .min(10, 'Minim 10 cifre.')
    .max(15, 'Maxim 15 cifre.')
    .nullable()
    .optional(),
  email: z.string().email('Email invalid.').nullable().optional(),
  contact: z.string().min(5, 'Minim 5 caractere.').nullable().optional(),
});
