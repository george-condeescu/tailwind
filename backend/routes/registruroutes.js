import express from 'express';
import {
  createRegistru,
  updateRegistru,
  findAllRegistru,
  getRegistruByNrInreg,
  deleteRegistru,
  searchRegistru,
} from '../controllers/registrucontrollers.js';

import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Define routes for registruController
router.get('/', cacheMiddleware(300), findAllRegistru);
router.get('/search', searchRegistru);
router.get('/:nr_inreg', cacheMiddleware(300), getRegistruByNrInreg);
router.post('/', createRegistru);
router.put('/:nr_inreg', updateRegistru);
router.delete('/:nr_inreg', deleteRegistru);
export default router;
