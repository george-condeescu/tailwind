import sequelize from '../utils/database.js';
import comentariuService from '../services/comentariuService.js';
import { myCache } from '../middleware/cacheMiddleware.js';

// create a new comentariu ==> POST /api/comentarii
const createComentariu = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const result = await sequelize.transaction(async (t) => {
      const newComentariu = await comentariuService.createComentariu(
        req.body,
        t,
      );
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(key);
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${newComentariu.document_id}`;
      myCache.del(documentComentariiKey);
      return newComentariu;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating comentariu:', error);
    res.status(500).json({ error: error.message });
  }
};

// get all comentarii ==> GET /api/comentarii
const getAllComentarii = async (req, res) => {
  try {
    const comentarii = await comentariuService.getAllComentarii();
    res.status(200).json(comentarii);
  } catch (error) {
    console.error('Error fetching all comentarii:', error);
    res.status(500).json({ error: error.message });
  }
};

// get comentariu by id ==> GET /api/comentarii/:id
const getComentariuById = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const comentariu = await comentariuService.findComentariuById(
      req.params.id,
    );
    if (!comentariu) {
      return res.status(404).json({ error: 'Comentariu not found' });
    }
    myCache.set(key, comentariu, 300);
    res.json(comentariu);
  } catch (error) {
    console.error('Error fetching comentariu:', error);
    res.status(500).json({ error: error.message });
  }
};

// get comentarii by document_id ==> GET /api/comentarii/document/:document_id
const getComentariiByDocumentId = async (req, res) => {
  try {
    const key = '__cache__' + req.originalUrl;
    const comentarii = await comentariuService.findComentariuByDocumentId(
      req.params.document_id,
    );
    if (!comentarii || comentarii.length === 0) {
      return res.status(204).json({ comentarii: [] }); // Return empty array if no comentarii are found, allowing the frontend to handle this case gracefully
    }
    myCache.set(key, comentarii, 300);
    res.status(200).json(comentarii);
  } catch (error) {
    console.error('Error fetching comentarii by document_id:', error);
    res.status(500).json({ error: error.message });
  }
};

// update comentariu ==> PUT /api/comentarii/:id
const updateComentariu = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const updatedComentariu = await comentariuService.updateComentariu(
        req.params.id,
        req.body,
        t,
      );
      
      //sterg si lista generala de comentarii
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${updatedComentariu.document_id}`;
      myCache.del(documentComentariiKey);

      return updatedComentariu;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating comentariu:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteComentariu = async (req, res) => {
  try {
    
    await sequelize.transaction(async (t) => {
      await comentariuService.deleteComentariu(req.params.id, t);
      
      //sterg si lista generala de comentarii
      const allComentariiKey = '__cache__/api/comentarii';
      myCache.del(allComentariiKey);
      //sterg si lista de comentarii pentru documentul respectiv
      const documentComentariiKey = `__cache__/api/comentarii/document/${req.params.document_id}`;
      myCache.del(documentComentariiKey);
    });
    res.json({ message: 'Comentariu deleted successfully' });
  } catch (error) {
    console.error('Error deleting comentariu:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createComentariu,
  getAllComentarii,
  getComentariuById,
  getComentariiByDocumentId,
  updateComentariu,
  deleteComentariu,
};
