import {z} from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie să aibă minim 8 caractere')
  .regex(/[A-Z]/, 'Trebuie cel puțin o literă mare')
  .regex(/[a-z]/, 'Trebuie cel puțin o literă mică')
  .regex(/[0-9]/, 'Trebuie cel puțin un număr')
  .regex(/[^A-Za-z0-9]/, 'Trebuie cel puțin un caracter special');

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
});