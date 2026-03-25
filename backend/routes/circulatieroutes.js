import express from 'express';

import {
  createCirculatie,
  trimiteDocument,
  getCirculatieById,
  getCirculatieByNrInreg,
  getCirculatieByDocumentId,
  getLastSender,
  getCirculatiiByUserId,
  updateCirculatie,
  deleteCirculatie,
  getLastCirculatieByDocumentId,
  markCirculatieAsCitit,
  closeCirculatie,
} from '../controllers/circulatiecontroller.js';

const circulatieRouter = express.Router();

circulatieRouter.post('/', createCirculatie);
circulatieRouter.post('/trimite', trimiteDocument);

circulatieRouter.get('/nr_inreg/:nr_inreg', getCirculatieByNrInreg);
circulatieRouter.get('/user/:user_id', getCirculatiiByUserId);
circulatieRouter.get('/document/:document_id', getCirculatieByDocumentId);
circulatieRouter.get('/:id', getCirculatieById);
circulatieRouter.put('/:id', updateCirculatie);
circulatieRouter.delete('/:id', deleteCirculatie);
circulatieRouter.get('/last-sender/:document_id/:user_id', getLastSender);
circulatieRouter.get(
  '/last-circulatie/:document_id',
  getLastCirculatieByDocumentId,
);
circulatieRouter.put('/mark-citit/:circulatie_id', markCirculatieAsCitit);
circulatieRouter.put('/close/:document_id', closeCirculatie);
export default circulatieRouter;
