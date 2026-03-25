import { Partner } from '../models/index.js';
import { partnerSchema } from '../validators/partner.schema.js';
import { myCache } from '../middleware/cacheMiddleware.js';

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

    return res.status(201).json(newPartner);
  } catch (error) {
    console.error('Error creating partner:', error);
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
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// get partner by id =? GET /api/partners/:id
const findPartnerById = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const cachedBody = myCache.get(key);

    if (cachedBody) {
      return res.status(200).json(cachedBody);
    }

    const { id } = req.params;
    const partner = await Partner.findByPk(id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    myCache.set(key, partner, 300);
    return res.status(200).json(partner);
  } catch (error) {
    console.error('Error fetching partner by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// update partner by id =? PUT /api/partners/:id
const updatePartner = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    const { id } = req.params;
    const partnerData = partnerSchema.safeParse(req.body);
    if (!partnerData.success) {
      return res.status(400).json({ error: partnerData.error });
    }

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
      return res.status(200).json(updatedPartner);
    }
    throw new Error('Partner not found');
  } catch (error) {
    console.error('Error updating partner:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// delete partner by id =? DELETE /api/partners/:id
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Partner.destroy({
      where: { id },
    });

    if (deleted) {
      const key = '__cache__' + req.originalUrl;
      myCache.del(key);
      invalidatePartnerListCache();
      return res.status(204).json({ message: 'Partner deleted successfully' });
    }
    throw new Error('Partner not found');
  } catch (error) {
    console.error('Error deleting partner:', error);
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
