import { Partner } from '../models/index.js';
import { partnerSchema } from '../validators/partner.schema.js';
import { myCache } from '../middleware/cacheMiddleware.js';
import sequelize from '../utils/database.js';
import logAuditEvent from '../services/auditService.js';

// Helper: audit în afara unei tranzacții
const auditWithNewConn = async (req, data) => {
  const conn = await sequelize.connectionManager.getConnection({ type: 'write' });
  try {
    await logAuditEvent(conn, { req, ...data });
  } finally {
    sequelize.connectionManager.releaseConnection(conn);
  }
};

// Invalidates all cached responses for the partner list (handles any query params)
const invalidatePartnerListCache = () => {
  const prefix = '__cache__/api/partners';
  myCache
    .keys()
    .filter(
      (k) =>
        k === prefix ||
        k === prefix + '/' ||
        k.startsWith(prefix + '?') ||
        k.startsWith(prefix + '/?'),
    )
    .forEach((k) => myCache.del(k));
};

// create a new partner => POST /api/partners
const createPartner = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    console.log('key', key);
    const partnerData = partnerSchema.safeParse(req.body);
    if (!partnerData.success) {
      return res.status(400).json({ error: partnerData.error });
    }

    const newPartner = await Partner.create(partnerData.data);
    invalidatePartnerListCache();

    await auditWithNewConn(req, {
      action: 'CREATE',
      entity_type: 'PARTNER',
      entity_id: newPartner.id,
      summary: `Partener nou creat cu ID: ${newPartner.id} (${newPartner.denumire}).`,
      after_data: newPartner,
    }).catch((e) => console.error('Audit error:', e));

    return res.status(201).json(newPartner);
  } catch (error) {
    console.error('Error creating partner:', error);
    await auditWithNewConn(req, {
      action: 'CREATE_ERROR',
      entity_type: 'PARTNER',
      entity_id: null,
      summary: `Eroare la crearea partenerului: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// get all partners =? GET /api/partners?page=1 or GET /api/partners?all=true
const findAllPartner = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const cachedBody = myCache.get(key);
    if (cachedBody) {
      return res.status(200).json(cachedBody);
    }

    if (req.query.all === 'true') {
      const rows = await Partner.findAll({ order: [['denumire', 'ASC']] });
      const result = {
        partners: rows,
        total: rows.length,
        totalPages: 1,
        currentPage: 1,
      };
      myCache.set(key, result, 300);
      await auditWithNewConn(req, {
        action: 'READ',
        entity_type: 'PARTNER',
        entity_id: null,
        summary: `Listare toți partenerii (${rows.length} rezultate).`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(200).json(result);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Partner.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
    });
    const result = {
      partners: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
    myCache.set(key, result, 300);
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'PARTNER',
      entity_id: null,
      summary: `Listare parteneri pagina ${page} (${rows.length} din ${count} rezultate).`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching partners:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'PARTNER',
      entity_id: null,
      summary: `Eroare la listarea partenerilor: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// get partner by id =? GET /api/partners/:id
const findPartnerById = async (req, res) => {
  const { id } = req.params;
  try {
    const key = '__cache__' + req.originalUrl;
    const cachedBody = myCache.get(key);

    if (cachedBody) {
      return res.status(200).json(cachedBody);
    }

    const partner = await Partner.findByPk(id);
    if (!partner) {
      await auditWithNewConn(req, {
        action: 'READ_NOT_FOUND',
        entity_type: 'PARTNER',
        entity_id: id,
        summary: `Partenerul cu ID: ${id} nu a fost găsit.`,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(404).json({ error: 'Partner not found' });
    }
    myCache.set(key, partner, 300);
    await auditWithNewConn(req, {
      action: 'READ',
      entity_type: 'PARTNER',
      entity_id: id,
      summary: `Partenerul cu ID: ${id} (${partner.denumire}) accesat.`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(200).json(partner);
  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    await auditWithNewConn(req, {
      action: 'READ_ERROR',
      entity_type: 'PARTNER',
      entity_id: id,
      summary: `Eroare la accesarea partenerului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// update partner by id =? PUT /api/partners/:id
const updatePartner = async (req, res) => {
  const { id } = req.params;
  try {
    const partnerData = partnerSchema.safeParse(req.body);
    if (!partnerData.success) {
      return res.status(400).json({ error: partnerData.error });
    }

    const before = await Partner.findByPk(id);

    //actualizam in baza de date
    await Partner.update(partnerData.data, {
      where: { id },
    });

    const updatedPartner = await Partner.findByPk(id);
    //actualizam cache-ul si returnam raspunsul
    if (updatedPartner) {
      const key = '__cache__' + req.originalUrl;
      myCache.set(key, updatedPartner, 300);
      invalidatePartnerListCache();
      await auditWithNewConn(req, {
        action: 'UPDATE',
        entity_type: 'PARTNER',
        entity_id: id,
        summary: `Partenerul cu ID: ${id} (${updatedPartner.denumire}) actualizat.`,
        before_data: before,
        after_data: updatedPartner,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(200).json(updatedPartner);
    }
    throw new Error('Partner not found');
  } catch (error) {
    console.error('Error updating partner:', error);
    await auditWithNewConn(req, {
      action: 'UPDATE_ERROR',
      entity_type: 'PARTNER',
      entity_id: id,
      summary: `Eroare la actualizarea partenerului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// delete partner by id =? DELETE /api/partners/:id
const deletePartner = async (req, res) => {
  const { id } = req.params;
  try {
    const before = await Partner.findByPk(id);

    const deleted = await Partner.destroy({
      where: { id },
    });

    if (deleted) {
      const key = '__cache__' + req.originalUrl;
      myCache.del(key);
      invalidatePartnerListCache();
      await auditWithNewConn(req, {
        action: 'DELETE',
        entity_type: 'PARTNER',
        entity_id: id,
        summary: `Partenerul cu ID: ${id} șters.`,
        before_data: before,
      }).catch((e) => console.error('Audit error:', e));
      return res.status(204).json({ message: 'Partner deleted successfully' });
    }
    throw new Error('Partner not found');
  } catch (error) {
    console.error('Error deleting partner:', error);
    await auditWithNewConn(req, {
      action: 'DELETE_ERROR',
      entity_type: 'PARTNER',
      entity_id: id,
      summary: `Eroare la ștergerea partenerului cu ID: ${id}: ${error.message}`,
    }).catch((e) => console.error('Audit error:', e));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  createPartner,
  findAllPartner,
  findPartnerById,
  updatePartner,
  deletePartner,
};
