import { Nrinreg } from '../models/index.js';
import { nrinregSchema } from '../validators/nrinreg.schema.js';
import sequelize from '../utils/database.js';
import logAuditEvent from '../services/auditService.js';

import { getNextIndex } from '../services/counterService.js';

// Helper: audit în afara unei tranzacții
const auditWithNewConn = async (req, data) => {
  const conn = await sequelize.connectionManager.getConnection({ type: 'write' });
  try {
    await logAuditEvent(conn, { req, ...data });
  } finally {
    sequelize.connectionManager.releaseConnection(conn);
  }
};

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
      await auditWithNewConn(req, {
        action: 'CREATE',
        entity_type: 'NRINREG',
        entity_id: nrInreg,
        summary: `Nr. înregistrare generat: ${nrInreg} (departament: ${departament}, an: ${year}).`,
        after_data: { departament, year, nr_inreg: nrInreg },
      }).catch((e) => console.error('Audit error:', e));
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
      await auditWithNewConn(req, {
        action: 'CREATE_ERROR',
        entity_type: 'NRINREG',
        entity_id: null,
        summary: `Eroare la generarea nr. înregistrare (departament: ${departament}, an: ${year}): ${err.message}`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(500).json({ error: 'Eroare la generarea numărului' });
    }
  }
};

// Get all Nrinreg records => GET /nrinreg
export const getAllNrinreg = async (req, res) => {
  try {
    const allNrinreg = await Nrinreg.findAll();
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'NRINREG',
      entity_id: null,
      summary: `Listare toate înregistrările nrinreg (${allNrinreg.length} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(200).json(allNrinreg);
  } catch (error) {
    console.error('Error fetching Nrinreg:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'NRINREG',
      entity_id: null,
      summary: `Eroare la listarea înregistrărilor nrinreg: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
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

    // dacă nu există, întoarce 0
    if (!nrinreg) {
      await auditWithNewConn(req, {
        action: 'READ',
        entity_type: 'NRINREG',
        entity_id: `${departament}-${year}`,
        summary: `Nrinreg pentru departament: ${departament}, an: ${year} nu există — returnat 0.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(200).json({
        departament,
        year,
        nrinreg: 0,
      });
    }

    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'NRINREG',
      entity_id: `${departament}-${year}`,
      summary: `Nrinreg accesat pentru departament: ${departament}, an: ${year} (last_number: ${nrinreg.last_number}).`,
    }).catch((e) => console.error('Audit error:', e));

    res.status(200).json({
      departament,
      year,
      nrinreg: nrinreg.last_number,
    });
  } catch (error) {
    console.error('Error fetching Nrinreg:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'NRINREG',
      entity_id: `${departament}-${year}`,
      summary: `Eroare la accesarea nrinreg pentru departament: ${departament}, an: ${year}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
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
      await auditWithNewConn(req, {
        action: 'DELETE_NOT_FOUND',
        entity_type: 'NRINREG',
        entity_id: `${departament}-${year}`,
        summary: `Ștergere nrinreg refuzată: nu există înregistrare pentru departament: ${departament}, an: ${year}.`,
      });
      return res.status(404).json({ message: 'Nrinreg not found' });
    }

    const before = nrinreg.toJSON();
    await nrinreg.destroy();

    await auditWithNewConn(req, {
      action: 'DELETE',
      entity_type: 'NRINREG',
      entity_id: `${departament}-${year}`,
      summary: `Nrinreg pentru departament: ${departament}, an: ${year} șters (last_number era: ${before.last_number}).`,
      before_data: before,
    }).catch((e) => console.error('Audit error:', e));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting Nrinreg:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'NRINREG',
      entity_id: `${departament}-${year}`,
      summary: `Eroare la ștergerea nrinreg pentru departament: ${departament}, an: ${year}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    res.status(500).json({ message: 'Internal server error' });
  }
};
