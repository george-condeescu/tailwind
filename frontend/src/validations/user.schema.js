import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie să aibă minim 8 caractere')
  .regex(/[A-Z]/, 'Trebuie cel puțin o literă mare')
  .regex(/[a-z]/, 'Trebuie cel puțin o literă mică')
  .regex(/[0-9]/, 'Trebuie cel puțin un număr')
  .regex(/[^A-Za-z0-9]/, 'Trebuie cel puțin un caracter special');

export const userCreateSchema = z.object({
  username: z.string().min(5, 'Minim 5 caractere.'),
  full_name: z.string().min(5, 'Minim 5 caractere.'),
  email: z.email('Email invalid'),
  password: passwordSchema,
  confirm_password: passwordSchema,
  department: z.coerce.number().int().positive('Alege un departament'),
  // is_admin: z.number().int().min(0).max(1),
  // is_active: z.number().int().min(0).max(1),
});

export const userUpdateSchema = z.object({
  username: z.string().min(5, 'Minim 5 caractere.').optional(),
  full_name: z.string().min(5, 'Minim 5 caractere.').optional(),
  email: z.email('Email invalid').optional(),
  password: passwordSchema.optional(),
  is_admin: z.number().int().min(0).max(1).optional(),
  is_active: z.number().int().min(0).max(1).optional(),
});
