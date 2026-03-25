import { Registru, Document, Circulatie } from '../models';
import sequelize from '../utils/database.js';
import { documentCompletSchema } from '../validators/documentComplet.schema.js';

import { getNextIndex } from '../services/counterService.js';

const createDocumentComplet = async (req, res) => {
  const validationResult = documentCompletSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.issues.map((e) => ({
      field: e.path[0],
      message: e.message,
    }));
    return res.status(400).json({ errors });
  }
  const {
    nr_inreg,
    user_id,
    partener_id,
    observatii,
    obiectul,
    cod_ssi,
    cod_angajament,
    status,
  } = validationResult.data;
  try {
    const t = await sequelize.transaction();
    const newRegistru = await Registru.create(
      {
        nr_inreg,
        user_id,
        partener_id,
        observatii,
        obiectul,
        cod_ssi,
        cod_angajament,
        status,
      },
      { transaction: t },
    );

    await Document.create(
      {
        nr_inreg,
        edited_by_user_id: user_id,
        content_snapshot: JSON.stringify({
          nr_inreg,
          user_id,
          partener_id,
          observatii,
          obiectul,
          cod_ssi,
          cod_angajament,
          status,
        }),
        note: 'Creare document initial.',
      },
      { transaction: t },
    );
    await Circulatie.create(
      {
        document_id: newRegistru.id,
        from_user_id: user_id,
        to_user_id: null, // La creare, documentul nu este încă circulat către alt utilizator
        created_by_user_id: user_id,
        note: 'Creare document initial.',
      },
      { transaction: t },
    );
    await t.commit();
    return res.status(201).json({
      success: true,
      message: 'Document complet creat cu succes',
      registruId: newRegistru.id,
    });
  } catch (error) {
    console.error('Eroare la crearea documentului complet:', error);
    return res.status(500).json({
      success: false,
      error: 'Eroare la crearea documentului complet',
    });
  }
};

export default {
  createDocumentComplet,
};
