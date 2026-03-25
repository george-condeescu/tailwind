import {z} from 'zod';

export const nrinregSchema = z.object({
    departament: z.string().max(10, { message: "Departamentul trebuie să aibă maximum 10 caractere" }),
    year: z.number().int().positive({ message: "Anul trebuie să fie un număr întreg pozitiv" }).refine((year) => year ==  new Date().getFullYear(), {
        message: "Anul trebuie să fie anul curent.",
    }),
    last_number: z.number().int().positive({ message: "Ultimul număr trebuie să fie un număr întreg pozitiv" }).optional(),
});