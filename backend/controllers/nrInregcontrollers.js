import { Nrinreg } from '../models/index.js';
import { nrinregSchema } from '../validators/nrinreg.schema.js';
import sequelize from '../utils/database.js';

import { getNextIndex } from '../services/counterService.js';

// Create a new Nrinreg record => POST /nrinreg
export const createNrinreg = async (req, res) => {
  // Validate request body against the Zod schema
  const nrinregData = nrinregSchema.safeParse(req.body);
  // If validation fails, return a 400 Bad Request with error details
  if (!nrinregData.success) {
    const errors = nrinregData.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));

    return res.status(400).json({ errors });
  }

  const { departament, year } = nrinregData.data;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    //initiam o tranzactie
    const t = await sequelize.transaction();
    try {
      // Obținem indexul unic în mod sigur
      const nextIdx = await getNextIndex(departament, year, t);
      const nrInreg = `${departament}${year}${String(nextIdx).padStart(4, '0')}`;

      await t.commit();
      console.log(`Generated nr_inreg: ${nrInreg}`);
      return res
        .status(201)
        .json({ message: 'Nrinreg created successfully', nr_inreg: nrInreg });
    } catch (err) {
      // Daca apare orice eroare facem ROLLBACK tranzactiei curente
      await t.rollback();
      const isRetryable =
        err.name === 'SequelizeOptimisticLockError' ||
        err.name === 'SequelizeUniqueConstraintError' ||
        (err.parent && err.parent.code === 'ER_LOCK_DEADLOCK');

      if (isRetryable && attempts < maxAttempts - 1) {
        attempts++;
        console.warn(`Retryable error encountered. Retrying... (${attempts})`);
        continue; // Reîncearcă tranzacția
      }
      // Dacă nu este o eroare de retry sau am epuizat tentativele, ieșim
      console.error('Final error:', err);
      return res.status(500).json({ error: 'Eroare la generarea numărului' });
    }
  }
};

// Get all Nrinreg records => GET /nrinreg
export const getAllNrinreg = async (req, res) => {
  try {
    const allNrinreg = await Nrinreg.findAll();
    res.status(200).json(allNrinreg);
  } catch (error) {
    console.error('Error fetching Nrinreg:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single Nrinreg record by departament and year => GET /nrinreg/:departament/:year
export const getNrinregByDepartamentAndYear = async (req, res) => {
  const { departament, year } = req.params;

  try {
    const nrinreg = await Nrinreg.findOne({
      where: {
        departament,
        year,
      },
    });

    // 👇 dacă nu există, întoarce 0
    if (!nrinreg) {
      return res.status(200).json({
        departament,
        year,
        nrinreg: 0,
      });
    }

    res.status(200).json({
      departament,
      year,
      nrinreg: nrinreg.last_number,
    });
  } catch (error) {
    console.error('Error fetching Nrinreg:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a Nrinreg record => DELETE /nrinreg/:departament/:year
export const deleteNrinreg = async (req, res) => {
  const { departament, year } = req.params;

  try {
    const nrinreg = await Nrinreg.findOne({
      where: {
        departament,
        year,
      },
    });
    if (!nrinreg) {
      return res.status(404).json({ message: 'Nrinreg not found' });
    }

    await nrinreg.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting Nrinreg:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
