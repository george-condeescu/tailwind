import sequelize from '../utils/database.js';
import documentService from '../services/documentService.js';
import circulatieService from '../services/circulatieService.js';
import { myCache } from '../middleware/cacheMiddleware.js';

// create a new Document => POST /api/documents
const createDocument = async (req, res) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const newDocument = await documentService.createDocument(req.body, t);
      const key = '__cache__' + req.originalUrl;
      // Invalidate cache after creating a new document
      const invalidatedKeys = myCache
        .keys()
        .filter((k) => k.startsWith('__cache__/api/documents'));
      invalidatedKeys.forEach((k) => myCache.del(k));

      return newDocument;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating Document:', error);
    res.status(500).json({ error: error.message });
  }
};

// get document by id => GET /api/documents/:id
const getDocumentById = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const document = await documentService.findDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    myCache.set(key, document, 300);
    res.json(document);
  } catch (error) {
    console.error('Error fetching Document:', error);
    res.status(500).json({ error: error.message });
  }
};

// documentele create de un utilizator => GET /api/documents/user/:user_id
const getDocumentsByUserId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const documents = await documentService.findDocumentsByUserId(
      req.params.user_id,
    );
    if (!documents) {
      return res.status(404).json({ error: 'Documents not found' });
    }
    const key = '__cache__' + req.originalUrl;
    myCache.set(key, documents, 300);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents by user_id:', error);
    res.status(500).json({ error: error.message });
  }
};

//documentele care sunt in inbox-ul unui utilizator => GET /api/documents/:user_id/inbox
const getDocumentsInInboxByUserId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    const documents = await documentService.findDocumentsInInboxByUserId(
      req.params.user_id,
    );
    if (!documents) {
      return res.status(404).json({ error: 'Documents not found' });
    }
    myCache.set(key, documents, 300);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents in inbox by user_id:', error);
    res.status(500).json({ error: error.message });
  }
};

// toate documentele care au trecut pe la un utilizator indiferent daca sunt in inbox sau outbox
// => GET /api/documents/all/:user_id
const getAllDocumentsByUserId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const documents = await documentService.findAllDocumentsByUserId(
      req.params.user_id,
    );
    if (!documents) {
      return res.status(404).json({ error: 'Documents not found' });
    }
    myCache.set(key, documents, 300);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching all documents by user_id:', error);
    res.status(500).json({ error: error.message });
  }
};

// numarul documentelor care sunt in inbox-ul unui utilizator
// => GET /api/documents/inbox/count/:user_id
const getDocumentsCountInInboxByUserId = async (req, res) => {
  const key = '__cache__' + req.originalUrl;

  try {
    const countResult = await documentService.getDocumentsCountInInboxByUserId(
      req.params.user_id,
    );
    myCache.set(key, countResult, 300);
    res.json(countResult);
  } catch (error) {
    console.error('Error fetching documents count in inbox by user_id:', error);
    res.status(500).json({ error: error.message });
  }
};

// documentele (reviziile) unui registru => GET /api/documents/nr-inreg/:nr_inreg
const getDocumentsByNrInreg = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  const cachedBody = myCache.get(key);
  if (cachedBody) {
    return res.status(200).json(cachedBody);
  }
  try {
    const documents = await documentService.findDocumentsByNrInreg(
      req.params.nr_inreg,
    );
    myCache.set(key, documents, 300);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents by nr_inreg:', error);
    res.status(500).json({ error: error.message });
  }
};

// update document by id => PUT /api/documents/:id
const updateDocument = async (req, res) => {
  const key = '__cache__' + req.originalUrl;

  console.log(`Received request to update Document with ID ${req.params.id}`);
  try {
    const result = await sequelize.transaction(async (t) => {
      const updatedDocument = await documentService.updateDocument(
        req.params.id,
        req.body,
        t,
      );
      const invalidatedKeys = myCache
        .keys()
        .filter((k) => k.startsWith('__cache__/api/documents'));
      invalidatedKeys.forEach((k) => myCache.del(k));
      return updatedDocument;
    });
    res.json(result);
  } catch (error) {
    console.error('Error updating Document:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  const key = '__cache__' + req.originalUrl;
  try {
    await sequelize.transaction(async (t) => {
      await documentService.deleteDocument(req.params.id, t);
      const invalidatedKeys = myCache
        .keys()
        .filter((k) => k.startsWith('__cache__/api/documents'));
      invalidatedKeys.forEach((k) => myCache.del(k));
    });
    res.status(204).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting Document:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createDocument,
  getDocumentById,
  getDocumentsByUserId,
  getDocumentsByNrInreg,
  getDocumentsInInboxByUserId,
  getAllDocumentsByUserId,
  updateDocument,
  deleteDocument,
  getDocumentsCountInInboxByUserId,
  // markDocumentAsCitit,
};
