import {
  Document,
  Registru,
  User,
  Circulatie,
  Partner,
  Fisier,
} from '../models/index.js';
import sequelize from '../utils/database.js';

import {
  documentCreateSchema,
  documentUpdateSchema,
} from '../validators/document.schema.js';

const createDocument = async (data, t) => {
  const validation = documentCreateSchema.safeParse(data);
  // console.log('Validation result for creating Document:', validation);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map((err) => err.message);
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
  const validData = validation.data;
  // console.log('Validated data for creating Document:', validData);
  // Verificăm dacă nr_inreg există în Registru
  if (validData.nr_inreg) {
    const existingRegistru = await Registru.findOne({
      where: { nr_inreg: validData.nr_inreg },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!existingRegistru) {
      throw new Error('Numărul de înregistrare nu există în Registru');
    }
  }
  //verificam dacă created_by_user_id există în User
  if (validData.created_by_user_id) {
    const existingUser = await User.findOne({
      where: { id: validData.created_by_user_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!existingUser) {
      throw new Error('ID-ul utilizatorului care a creat documentul nu există');
    }
  }
  //determinam ultima revizie pentru nr_inreg
  const lastDocument = await Document.findOne({
    where: { nr_inreg: validData.nr_inreg },
    order: [['createdAt', 'DESC']],
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  validData.nr_revizie = lastDocument ? lastDocument.nr_revizie + 1 : 1;

  try {
    const newDocument = await Document.create(validData, { transaction: t });
    return newDocument;
  } catch (error) {
    console.error('Error creating Document:', error);
    throw error;
  }
};

const findDocumentById = async (id, options = {}) => {
  const optionsWithInclude = {
    ...options,
    attributes: [
      'id',
      'nr_revizie',
      'note',
      'current_user_id',
      'created_by_user_id',
      'nr_inreg',
    ],
    include: [
      {
        model: Registru,
        as: 'registru',
        attributes: [
          'nr_inreg',
          'createdAt',
          'obiectul',
          'cod_ssi',
          'cod_angajament',
          'status',
        ],
        include: [
          {
            model: Partner,
            as: 'partner',
            attributes: ['id', 'denumire'],
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'full_name'],
          },
        ],
      },
      {
        model: Circulatie,
        as: 'circulatii',
        attributes: ['id', 'data_intrare', 'data_iesire', 'action', 'note'],
        include: [
          {
            model: User,
            as: 'from_user',
            attributes: ['id', 'full_name'],
          },
          {
            model: User,
            as: 'to_user',
            attributes: ['id', 'full_name'],
          },
        ],
      },
      {
        model: User,
        as: 'current_user',
        attributes: ['id', 'full_name'],
      },
    ],
  };
  try {
    const document = await Document.findByPk(id, optionsWithInclude);
    return document;
  } catch (error) {
    console.error('Error finding Document:', error);
    throw error;
  }
};

// documentele create de un utilizator
const findDocumentsByUserId = async (created_by_user_id, options = {}) => {
  try {
    const documente = await Document.findAll({
      where: { created_by_user_id },
      ...options,
    });
    return documente;
  } catch (error) {
    console.error('Error finding documents by created_by_user_id:', error);
    throw error;
  }
};

// toate documentele care au trecut pe la un utilizator
// indiferent daca sunt in inbox sau outbox
const findAllDocumentsByUserId = async (current_user_id, options = {}) => {
  try {
    const documente = await sequelize.query(
      `SELECT
        d.id,
        d.nr_inreg,
        d.nr_revizie,
        d.note,
        d.created_by_user_id,
        d.current_user_id,
        d.createdAt as data_creare,
        u1.full_name as utilizator_curent,
        reg.obiectul,
        p.denumire as partener,
        ou.name as provenienta,
        (SELECT dc2.citit FROM document_circulation dc2
          WHERE dc2.document_id = d.id
          ORDER BY dc2.id DESC LIMIT 1) as citit

      FROM documents d
      JOIN users u1 ON u1.id = d.current_user_id
      JOIN registers reg ON reg.nr_inreg = d.nr_inreg
      JOIN partner p ON p.id = reg.partener_id
      JOIN (
        SELECT user_id, MIN(org_unit_id) AS org_unit_id
        FROM user_membership
        GROUP BY user_id
      ) um ON um.user_id = d.created_by_user_id
      JOIN org_units ou ON ou.id = um.org_unit_id
      WHERE EXISTS (
        SELECT 1 FROM document_circulation dc
        WHERE dc.document_id = d.id AND (dc.from_user_id = :userId OR dc.to_user_id = :userId)
      );`,
      {
        replacements: { userId: current_user_id },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return documente;
  } catch (error) {
    console.error('Error finding documents by current_user_id:', error);
    throw error;
  }
};

// documentele care sunt in inbox-ul unui utilizator
const findDocumentsInInboxByUserId = async (current_user_id, options = {}) => {
  try {
    const documente = await sequelize.query(
      `SELECT r.nr_inreg, r.obiectul, r.cod_ssi, r.cod_angajament, r.status, r.createdAt,
      d.nr_revizie, d.note,
      u2.full_name as from_user,
      u3.full_name as register_user,
      dc.data_intrare,
      dc.citit,
      p.denumire as partener,
      d.id,
      dc.id as circulatie_id
    FROM documents d
    JOIN registers r ON d.nr_inreg = r.nr_inreg
    -- AICI ESTE CHEIA: Join doar cu ultimul ID din circulație per document
    JOIN document_circulation dc ON dc.id = (
      SELECT id 
      FROM document_circulation 
      WHERE document_id = d.id and from_user_id = :current_user_id
      ORDER BY id DESC
      LIMIT 1
    )
    JOIN users u2 ON u2.id = dc.from_user_id
    JOIN users u3 ON u3.id = r.user_id
    JOIN partner p ON p.id = r.partener_id
    WHERE d.current_user_id = :current_user_id
    ORDER BY dc.data_intrare DESC;`,
      {
        replacements: { current_user_id },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return documente;
  } catch (error) {
    console.error(
      'Error finding documents in inbox by current_user_id:',
      error,
    );
    throw error;
  }
};

const getDocumentsCountInInboxByUserId = async (current_user_id) => {
  try {
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM documents d
      JOIN document_circulation dc ON d.id = dc.document_id
      WHERE d.current_user_id = :current_user_id and dc.citit is NULL;`,
      {
        replacements: { current_user_id },
        type: sequelize.QueryTypes.SELECT,
      },
    );
    console.log(
      `Count of documents in inbox for user ${current_user_id}:`,
      countResult[0].count,
    );
    return countResult[0].count;
  } catch (error) {
    console.error('Error counting documents in inbox:', error);
    throw error;
  }
};

const findDocumentsByNrInreg = async (nr_inreg) => {
  try {
    const documente = await Document.findAll({
      where: { nr_inreg },
      order: [['nr_revizie', 'ASC']],
      attributes: [
        'id',
        'nr_inreg',
        'nr_revizie',
        'note',
        'created_by_user_id',
        'current_user_id',
        'createdAt',
      ],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name'],
        },
        {
          model: Fisier,
          as: 'fisiere',
          attributes: [
            'id',
            'original_name',
            'file_name',
            'mime_type',
            'createdAt',
          ],
        },
      ],
    });
    return documente;
  } catch (error) {
    console.error('Error finding documents by nr_inreg:', error);
    throw error;
  }
};

const updateDocument = async (id, data, t) => {
  const validation = documentUpdateSchema.safeParse(data);
  if (!validation.success) {
    const errorMessages = validation.error.errors.map((err) => err.message);
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
  const validData = validation.data;
  // Verificăm dacă nr_inreg există în Registru
  if (validData.nr_inreg) {
    const existingRegistru = await Registru.findOne({
      where: { nr_inreg: validData.nr_inreg },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!existingRegistru) {
      throw new Error('Numărul de înregistrare nu există în Registru');
    }
  }
  try {
    const document = await findDocumentById(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!document) {
      throw new Error('Document not found');
    }
    await Document.update(validData, { where: { id }, transaction: t });
    return document;
  } catch (error) {
    console.error('Error updating Document:', error);
    throw error;
  }
};

const deleteDocument = async (id, t) => {
  try {
    const document = await findDocumentById(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!document) {
      throw new Error('Document not found');
    }
    await document.destroy({ transaction: t });
    return true;
  } catch (error) {
    console.error('Error deleting Document:', error);
    throw error;
  }
};

export default {
  createDocument,
  findDocumentById,
  findDocumentsByUserId,
  findDocumentsByNrInreg,
  findDocumentsInInboxByUserId,
  getDocumentsCountInInboxByUserId,
  findAllDocumentsByUserId,
  updateDocument,
  deleteDocument,
};
