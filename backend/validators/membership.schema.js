import { coerce, z } from 'zod';

export const membershipCreateSchema = z
  .object({
    org_unit_id: z.number().int().min(0),
    start_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Formatul start_date trebuie să fie YYYY-MM-DD',
      ).optional()
      .refine((val) => {
        if (!val) return true; // Dacă nu este furnizată, considerăm validă
        const [year, month, day] = val.split('-');
        const newDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        let today = new Date();
        today.setTime(0, 0, 0, 0);
        if (newDate >= today) return true;
      }, 'Ziua de start trebuie sa fie minim ziua curenta.'),
    end_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Formatul end_date trebuie să fie YYYY-MM-DD',
      )
      .nullable().optional(),
  })
  .refine(
    (data) => {
      // Dacă oricare dintre date lipsește, nu avem ce compara, deci e valid
      if (!data.start_date || !data.end_date) return true;

      // Dacă există o dată, verificăm să fie mai mare decât data_start
      return data.end_date > data.start_date;
    },
    {
      message:
        'Data de final trebuie să fie după data de început sau să fie lăsată goală',
      path: ['end_date'], // Eroarea va fi atribuită câmpului data_end
    },
  );
