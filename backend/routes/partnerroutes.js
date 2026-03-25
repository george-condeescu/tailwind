import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

import {
  createPartner,
  updatePartner,
  deletePartner,
  findAllPartner,
  findPartnerById,
} from '../controllers/partnercontroller.js';

const partnerRouter = express.Router();

partnerRouter.post('/', createPartner);
partnerRouter.put('/:id', updatePartner);
partnerRouter.delete('/:id', deletePartner);
partnerRouter.get('/:id', cacheMiddleware(300), findPartnerById);
partnerRouter.get('/', cacheMiddleware(300), findAllPartner);

export default partnerRouter;
