import { Registru, Partner, User } from '../models/index.js';
import {
  createRegistruSchema,
  updateRegistruSchema,
} from '../validators/registru.schema.js';

import { myCache } from '../middleware/cacheMiddleware.js';

const createRegistru = async (data, t) => {
  try {
    const validation = createRegistruSchema.safeParse(data);
    if (!validation.success) {
      console.log('Validation errors:', validation.error);
      const errorMessages = validation.error.errors.map((err) => err.message);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    const validatedData = validation.data;
    const newRegistru = await Registru.create(validatedData, {
      transaction: t,
    });

    myCache.del('__cache__/api/registru'); // Invalidate cache
    return newRegistru;
  } catch (error) {
    console.error('Eroare la crearea registrului:', error);
    throw new Error('Eroare la crearea registrului');
  }
};

const findRegistruByNrInreg = async (nr_inreg, options = {}) => {
  try {
    const registru = await Registru.findOne({
      where: { nr_inreg },
      include: [
        { model: Partner, as: 'partner' },
        { model: User, as: 'creator', attributes: ['id', 'full_name'] },
      ],
      ...options,
    });
    myCache.set(`__cache__/api/registru/${nr_inreg}`, registru); // Cache the result
    return registru;
  } catch (error) {
    console.error('Eroare la găsirea registrului:', error);
    throw new Error('Eroare la găsirea registrului');
  }
};

const updateRegistru = async (nr_inreg, data, t) => {
  data.nr_inreg = nr_inreg; // Asigurăm că nr_inreg este inclus în datele validate
  try {
    const registru = await findRegistruByNrInreg(nr_inreg, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!registru) {
      throw new Error('Registru nu a fost găsit');
    }
    const validation = updateRegistruSchema.safeParse(data);
    if (!validation.success) {
      console.log('Validation errors:', validation.error);
      const errorMessages = validation.error.errors.map((err) => err.message);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    const validatedData = validation.data;
    console.log('Validated data for update:', validatedData);
    await registru.update(validatedData, { transaction: t });

    myCache.del('__cache__/api/registru'); // Invalidate cache
    myCache.del(`__cache__/api/registru/${nr_inreg}`); // Invalidate cache for specific registru
    return registru;
  } catch (error) {
    console.error('Eroare la actualizarea registrului:', error);
    throw new Error('Eroare la actualizarea registrului');
  }
};

const deleteRegistru = async (nr_inreg, t) => {
  try {
    const registru = await findRegistruByNrInreg(nr_inreg, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!registru) {
      const err = new Error('Registru nu a fost găsit');
      err.status = 404;
      throw err;
    }
    await registru.destroy({ transaction: t });
    myCache.del('__cache__/api/registru'); // Invalidate cache
    myCache.del(`__cache__/api/registru/${nr_inreg}`); // Invalidate cache for specific registru
    console.log(`Registru cu nr_inreg ${nr_inreg} a fost șters cu succes.`);
    return true;
  } catch (error) {
    console.error('Eroare la ștergerea registrului:', error);
    if (error.status === 404) {
      throw error;
    }
    // altfel, eroare neașteptată
    const err = new Error('Eroare la ștergerea registrului');
    err.status = 500;
    throw err;
  }
};

export default {
  createRegistru,
  findRegistruByNrInreg,
  updateRegistru,
  deleteRegistru,
};
