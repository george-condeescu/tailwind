import express from 'express';
import multer from 'multer';

import {
  uploadFisier,
  uploadMultipleFiles,
  getFisiereByDocumentId,
  getAllFiles,
  deleteFisierById,
} from '../controllers/fisiercontrollers.js';

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const upload = multer({ dest: 'uploads/' }); // Configurare multer pentru a salva fișierele în folderul "uploads"

const router = express.Router();

router.get('/:documentId', getFisiereByDocumentId);
router.get('/', cacheMiddleware(300), getAllFiles);

// Endpoint pentru încărcarea unui fișier asociat unei revizii
router.post('/upload', upload.single('file'), uploadFisier);
// Endpoint pentru încărcarea mai multor fișiere asociate unei revizii
router.post('/upload-multiple', upload.array('files'), uploadMultipleFiles);
router.delete('/:id', deleteFisierById);

export default router;
