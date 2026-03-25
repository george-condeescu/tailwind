import { Nrinreg } from '../models/index.js';

const getNextIndex = async (dept, yr, transaction) => {
  // 1. Încercăm să găsim rândul cu LOCK
  let row = await Nrinreg.findOne({
    where: { departament: dept, year: yr },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (!row) {
    // 2. Dacă nu există, încercăm să-l creăm (INSERT)
    try {
      await Nrinreg.create(
        {
          departament: dept,
          year: yr,
          last_number: 1,
        },
        { transaction },
      );
      return 1; // Primul index pentru acest departament și an
    } catch (err) {
      // 3. Dacă cineva l-a creat între timp UniqueConstraintError,
      // trebuie sa re-citim randul existentcu LOCK
      row = await Nrinreg.findOne({
        where: { departament: dept, year: yr },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      // Dacă tot nu găsim rândul, înseamnă că a apărut o problemă neașteptată
      if (!row) {
        throw new Error('Failed to create or find counter row');
      }
    }
  }

  // 4. Incrementăm (UPDATE)
  const newIndex = row.last_number + 1;
  await row.update({ last_number: newIndex }, { transaction });
  return newIndex;
};

export { getNextIndex };
