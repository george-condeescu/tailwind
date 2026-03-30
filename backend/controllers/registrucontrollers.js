import { Op, literal } from 'sequelize';
import { Registru, Document, Partner, User, Nrinreg } from '../models/index.js';
import registruService from '../services/registruService.js';
import sequelize from '../utils/database.js';
import { myCache } from '../middleware/cacheMiddleware.js';
import logAuditEvent from '../services/auditService.js';

// Create Registru -> POST /api/registru
const createRegistru = async (req, res) => {
  const key = '__cache__' + req.originalUrl; // Cache key based on the request URL
  // Obtin last_number generat pentru departament si an,
  // apoi incrementam pentru a genera urmatorul nr_inreg
  const { departament, year } = req.body;

  const last_number = await Nrinreg.findOne({
    where: { departament, year },
    order: [['createdAt', 'DESC']],
  });

  const nextIndex = parseInt(last_number?.last_number) + 1 || 1;
  req.body.nr_inreg = `${departament}${year}${String(nextIndex).padStart(4, '0')}`;
  try {
    const result = await sequelize.transaction(async (t) => {
      const newRegistru = await registruService.createRegistru(req.body, t);
      if (!last_number) {
        await Nrinreg.create(
          { departament, year, last_number: nextIndex },
          { transaction: t },
        );
      } else {
        last_number.last_number = nextIndex;
        await last_number.save({ transaction: t });
      }
      await logAuditEvent(t.connection, {
        req,
        action: 'CREATE',
        entity_type: 'DOCUMENT',
        entity_id: newRegistru.nr_inreg,
        summary: `Registru nou creat cu nr_inreg: ${newRegistru.nr_inreg}.`,
        after_data: newRegistru,
      });
      myCache.del(key);
      return newRegistru;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating registru:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Registru -> GET /api/registru
const findAllRegistru = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const registruri = await Registru.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name'],
        },
        {
          model: Partner,
          as: 'partner',
          attributes: ['id', 'denumire'],
        },
      ],
    });
    myCache.set(key, registruri, 300);
    res.json(registruri);
  } catch (error) {
    console.error('Error fetching registruri:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Registru by NrInreg -> GET /api/registru/:nr_inreg
const getRegistruByNrInreg = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const registru = await registruService.findRegistruByNrInreg(
      req.params.nr_inreg,
    );
    if (!registru) {
      return res.status(404).json({ error: 'Registru not found' });
    }
    myCache.set(key, registru, 300);
    res.json(registru);
  } catch (error) {
    console.error('Error fetching registru:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update Registru -> PUT /api/registru/:nr_inreg
const updateRegistru = async (req, res) => {
  const key = '__cache__' + req.originalUrl;

  try {
    const before = await registruService.findRegistruByNrInreg(
      req.params.nr_inreg,
    );
    const result = await sequelize.transaction(async (t) => {
      const updatedRegistru = await registruService.updateRegistru(
        req.params.nr_inreg,
        req.body,
        t,
      );
      await logAuditEvent(t.connection, {
        req,
        action: 'UPDATE',
        entity_type: 'DOCUMENT',
        entity_id: req.params.nr_inreg,
        summary: `Registru cu nr_inreg: ${req.params.nr_inreg} actualizat.`,
        before_data: before,
        after_data: updatedRegistru,
      });
      myCache.del(key);
      return updatedRegistru;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating registru:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Registru -> DELETE /api/registru/:nr_inreg
const deleteRegistru = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    const before = await registruService.findRegistruByNrInreg(
      req.params.nr_inreg,
    );
    await sequelize.transaction(async (t) => {
      await registruService.deleteRegistru(req.params.nr_inreg, t);
      await logAuditEvent(t.connection, {
        req,
        action: 'DELETE',
        entity_type: 'DOCUMENT',
        entity_id: req.params.nr_inreg,
        summary: `Registru cu nr_inreg: ${req.params.nr_inreg} șters.`,
        before_data: before,
      });
      myCache.del(key);
    });
    res.status(204).send();
  } catch (error) {
    // console.error('Error deleting registru:', error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

// Search Registru with filters -> GET /api/registru/search
const searchRegistru = async (req, res) => {
  const {
    nr_inreg,
    nr_revizie,
    partener,
    obiectul,
    cod_ssi,
    cod_angajament,
    status,
    observatii,
    createdAt_start,
    createdAt_end,
    updatedAt_start,
    updatedAt_end,
  } = req.query;

  const currentUserId = parseInt(req.user.userId);

  try {
    const registruWhere = {};
    const documentWhere = {};

    if (req.query.created_by_me === 'true') {
      // Doar registrele create de utilizatorul curent
      registruWhere.user_id = currentUserId;
    } else {
      // Filtrare automată: documentele create de sau care au trecut pe la utilizatorul curent
      registruWhere[Op.and] = [
        literal(`(
          \`Registru\`.\`user_id\` = ${currentUserId}
          OR \`Registru\`.\`nr_inreg\` IN (
            SELECT DISTINCT d.nr_inreg FROM documents d
            WHERE d.created_by_user_id = ${currentUserId}
               OR d.current_user_id = ${currentUserId}
          )
          OR \`Registru\`.\`nr_inreg\` IN (
            SELECT DISTINCT d.nr_inreg FROM documents d
            INNER JOIN document_circulation c ON c.document_id = d.id
            WHERE c.to_user_id = ${currentUserId}
               OR c.from_user_id = ${currentUserId}
          )
        )`),
      ];
    }

    if (nr_inreg) registruWhere.nr_inreg = { [Op.like]: `%${nr_inreg}%` };
    if (obiectul) registruWhere.obiectul = { [Op.like]: `%${obiectul}%` };
    if (cod_ssi) registruWhere.cod_ssi = { [Op.like]: `%${cod_ssi}%` };
    if (cod_angajament)
      registruWhere.cod_angajament = { [Op.like]: `%${cod_angajament}%` };
    if (status) registruWhere.status = status;
    if (observatii) registruWhere.observatii = { [Op.like]: `%${observatii}%` };

    if (createdAt_start || createdAt_end) {
      registruWhere.createdAt = {};
      if (createdAt_start)
        registruWhere.createdAt[Op.gte] = new Date(createdAt_start);
      if (createdAt_end)
        registruWhere.createdAt[Op.lte] = new Date(createdAt_end + 'T23:59:59');
    }
    if (updatedAt_start || updatedAt_end) {
      registruWhere.updatedAt = {};
      if (updatedAt_start)
        registruWhere.updatedAt[Op.gte] = new Date(updatedAt_start);
      if (updatedAt_end)
        registruWhere.updatedAt[Op.lte] = new Date(updatedAt_end + 'T23:59:59');
    }

    if (nr_revizie) documentWhere.nr_revizie = Number(nr_revizie);

    const hasDocumentFilter = Object.keys(documentWhere).length > 0;

    const results = await Registru.findAll({
      where: registruWhere,
      include: [
        {
          model: Document,
          as: 'documents',
          where: hasDocumentFilter ? documentWhere : undefined,
          required: hasDocumentFilter,
        },
        {
          model: Partner,
          as: 'partner',
          where: partener
            ? { denumire: { [Op.like]: `%${partener}%` } }
            : undefined,
          required: !!partener,
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching registru:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createRegistru,
  getRegistruByNrInreg,
  findAllRegistru,
  updateRegistru,
  deleteRegistru,
  searchRegistru,
};
