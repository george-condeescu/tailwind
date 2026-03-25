import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

import {
  createComentariu,
  getAllComentarii,
  getComentariuById,
  getComentariiByDocumentId,
  updateComentariu,
  deleteComentariu,
} from '../controllers/comentariucontrollers.js';

const comentariuRouter = express.Router();

comentariuRouter.post('/', createComentariu);
comentariuRouter.get('/', cacheMiddleware(300), getAllComentarii);

comentariuRouter.get(
  '/document/:document_id',
  cacheMiddleware(300),
  getComentariiByDocumentId,
);
comentariuRouter.get('/:id', cacheMiddleware(300), getComentariuById);
comentariuRouter.put('/:id', updateComentariu);
comentariuRouter.delete('/:id', deleteComentariu);

export default comentariuRouter;
