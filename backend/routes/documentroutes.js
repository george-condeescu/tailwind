import express from 'express';
import {
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
} from '../controllers/documentcontroller.js';

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.post('/', createDocument);

router.get('/nr-inreg/:nr_inreg', getDocumentsByNrInreg);
router.get('/user/:user_id', getDocumentsByUserId);
router.get(
  '/user/:user_id/inbox',
  cacheMiddleware(300), // Cachează răspunsul pentru 5 minute (300 secunde)
  getDocumentsInInboxByUserId,
);
router.get(
  '/user/:user_id/inbox/count',
  cacheMiddleware(300), // Cachează răspunsul pentru 5 minute (300 secunde)
  getDocumentsCountInInboxByUserId,
);
router.get('/user/:user_id/all', getAllDocumentsByUserId);

router.get('/:id', getDocumentById); // toate datele unui document
// router.put('/:id/citit', markDocumentAsCitit);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
