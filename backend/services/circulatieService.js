import { parse } from 'dotenv';
import { Circulatie } from '../models/index.js';
import sequelize from '../utils/database.js';
import { circulatieSchema } from '../validators/circulatie.schema.js';

const createCirculatie = async (data, t) => {
  data.data_intrare = new Date();
  if (data.data_iesire) {
    data.data_iesire = new Date(data.data_iesire);
  }
  console.log('Creating circulatie with data:', data);
  const validation = circulatieSchema.safeParse(data);

  if (!validation.success) {
    // Folosim issues în loc de errors, cu o protecție suplimentară (optional chaining)
    const errorMessages = validation.error?.issues?.map(
      (err) => err.message,
    ) || ['Eroare necunoscută'];
    throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
  }
  const validData = validation.data;
  try {
    const newCirculatie = await Circulatie.create(validData, {
      transaction: t,
    });
    return newCirculatie;
  } catch (error) {
    console.error('Error creating circulatie:', error);
    throw error;
  }
};

const trimiteDocument = async (
  document_id,
  to_user_id,
  from_user_id,
  note,
  t,
) => {
  try {
    const data = {
      document_id: parseInt(document_id, 10),
      from_user_id: parseInt(from_user_id, 10),
      to_user_id: parseInt(to_user_id, 10),
      note,
      action: 'SEND',
    };
    // ultima circulatie pentru documentul respectiv, unde data_iesire e null,
    // adica circulatia activa, pe care o inchid prin setarea data_iesire la momentul actual
    const lastCirculatie = await getLastCirculatieByDocumentId(document_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!lastCirculatie || lastCirculatie.length === 0) {
      throw new Error('No active circulatie found for this document');
    }

    lastCirculatie.data_iesire = new Date();
    lastCirculatie.action = 'SEND';
    lastCirculatie.to_user_id = parseInt(to_user_id, 10);
    lastCirculatie.note = note;

    await lastCirculatie.save({ transaction: t });

    // creez o noua circulatie pentru destinatar, cu data_intrare setata la momentul actual
    const dataNouaCirculatie = {
      document_id,
      action: 'RECEIVE',
      from_user_id: parseInt(to_user_id, 10),
      to_user_id: null,
      note,
      data_intrare: new Date(),
      data_iesire: null,
    };
    const newCirculatie = await createCirculatie(dataNouaCirculatie, t);

    //setez current_user_id in document la to_user_id
    await sequelize.query(
      `update documents set current_user_id=:to_user_id where id=:document_id;`,
      {
        replacements: { to_user_id, document_id },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      },
    );

    return newCirculatie;
  } catch (error) {
    console.error('Error sending document:', error);
    throw error;
  }
};

const closeCirculatie = async (document_id, t) => {
  try {
    const lastCirculatie = await getLastCirculatieByDocumentId(document_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!lastCirculatie || lastCirculatie.length === 0) {
      throw new Error('No active circulatie found for this document');
    }

    lastCirculatie.data_iesire = new Date();
    lastCirculatie.action = 'CLOSE';

    await lastCirculatie.save({ transaction: t });

    //setez current_user_id in document la null, pentru ca documentul e inchis
    await sequelize.query(
      `update documents set current_user_id=null, note='Document closed' where id=:document_id;`,
      {
        replacements: { document_id },
        type: sequelize.QueryTypes.UPDATE,
        transaction: t,
      },
    );

    return lastCirculatie;
  } catch (error) {
    console.error('Error closing circulatie:', error);
    throw error;
  }
};

const findCirculatieById = async (id, options = {}) => {
  try {
    const circulatie = await Circulatie.findByPk(id, options);
    return circulatie;
  } catch (error) {
    console.error('Error finding circulatie:', error);
    throw error;
  }
};

//nu are sens sa caut circulatie dupa nr_inreg, pentru ca
// circulatia este legata de id-ul documentului, iar nr_inreg este legat de registru,
// deci nu folosesc asta
const findCirculatieByNrInreg = async (nr_inreg, options = {}) => {
  try {
    const circulatie = await sequelize.query(
      `select circ.id, reg.nr_inreg, circ.action, circ.from_user_id, circ.to_user_id, 
        circ.note, circ.data_intrare, circ.data_iesire from registers reg 
        inner join documents rev on reg.nr_inreg=rev.nr_inreg 
        inner join document_circulation circ on rev.id=circ.document_id 
        where reg.nr_inreg=:nr_inreg
        order by circ.data_intrare asc;`,
      {
        replacements: { nr_inreg },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      },
    );
    return circulatie;
  } catch (error) {
    console.error('Error finding circulatie by nr_inreg:', error);
    throw error;
  }
};

// find circulatie dupa document_id, pentru a putea vedea toata circulatia unui document
const findCirculatieByDocumentId = async (document_id, options = {}) => {
  try {
    const circulatie = await sequelize.query(
      `select 
        circ.id, 
        reg.nr_inreg, 
        par.denumire as partener, 
        action, 
        u.full_name as from_user, 
        u2.full_name as to_user,
        circ.note, 
        circ.data_intrare, 
        circ.data_iesire,
        circ.citit 
      from registers reg 
      inner join documents rev on reg.nr_inreg=rev.nr_inreg 
      inner join document_circulation circ on rev.id=circ.document_id 
      inner join partner par on reg.partener_id=par.id
      inner join users u on circ.from_user_id=u.id
      left join users u2 on circ.to_user_id=u2.id
      where rev.id=:document_id
      order by circ.data_intrare asc;`,
      {
        replacements: { document_id },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      },
    );
    return circulatie;
  } catch (error) {
    console.error('Error finding circulatie by document_id:', error);
    throw error;
  }
};

const findCirculatiiByUserId = async (user_id, options = {}) => {
  console.log('Finding circulatii for user_id:', user_id);
  try {
    const circulatii = await sequelize.query(
      `select 
        circ.id, 
        reg.nr_inreg, 
        par.denumire as partener, 
        action, 
        full_name as from_user, 
        to_user_id, 
        circ.note, 
        circ.data_intrare, 
        circ.data_iesire ,

      from registers reg 
      inner join documents rev on reg.nr_inreg=rev.nr_inreg 
      inner join document_circulation circ on rev.id=circ.document_id 
      inner join partner par on reg.partener_id=par.id
      inner join users u on circ.from_user_id=u.id
      where rev.id=:document_id;`,
      {
        replacements: { document_id },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      },
    );
    return circulatii;
  } catch (error) {
    console.error('Error finding circulatii by document_id:', error);
    throw error;
  }
};

const updateCirculatie = async (id, data, t) => {
  try {
    const circulatie = await findCirculatieById(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!circulatie) {
      throw new Error('Circulatie not found');
    }
    const validation = circulatieSchema.safeParse(data);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map((err) => err.message);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    const validData = validation.data;
    await circulatie.update(validData, { transaction: t });
    return circulatie;
  } catch (error) {
    console.error('Error updating circulatie:', error);
    throw error;
  }
};

const deleteCirculatie = async (id, t) => {
  try {
    const circulatie = await findCirculatieById(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!circulatie) {
      throw new Error('Circulatie not found');
    }
    await circulatie.destroy({ transaction: t });
    return true;
  } catch (error) {
    console.error('Error deleting circulatie:', error);
    throw error;
  }
};

const markCitit = async (circulatie_id) => {
  try {
    await sequelize.query(
      `UPDATE document_circulation SET citit = NOW()
       WHERE id = :circulatie_id AND citit IS NULL`,
      {
        replacements: { circulatie_id },
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  } catch (error) {
    console.error('Error marking circulatie as citit:', error);
    throw error;
  }
};

const getLastCirculatieByDocumentId = async (document_id, options = {}) => {
  try {
    const lastCirculatie = await Circulatie.findOne({
      where: { document_id, data_iesire: null },
    });
    return lastCirculatie;
  } catch (error) {
    console.error('Error finding last circulatie by document_id:', error);
    throw error;
  }
};

export default {
  createCirculatie,
  findCirculatieById,
  findCirculatieByNrInreg,
  findCirculatieByDocumentId,
  updateCirculatie,
  deleteCirculatie,
  findCirculatiiByUserId,
  trimiteDocument,
  getLastCirculatieByDocumentId,
  markCitit,
  closeCirculatie,
};
