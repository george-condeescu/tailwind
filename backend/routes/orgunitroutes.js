import express from 'express';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

import {
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  findAllOrgUnit,
  findOrgUnitById,
  getUserDirectie,
  getSubordonati,
  getDirectionSubtree,
  getDepartmentCount,
  findDepartmentByUserId,
} from '../controllers/orgunitcontroller.js';

const orgunitRouter = express.Router();

orgunitRouter.post('/', createOrgUnit);
orgunitRouter.put('/:id', updateOrgUnit);
orgunitRouter.delete('/:id', deleteOrgUnit);

orgunitRouter.get('/:id', cacheMiddleware(300), findOrgUnitById);
orgunitRouter.get('/', cacheMiddleware(300), findAllOrgUnit);
orgunitRouter.get(
  '/user/:userId',
  cacheMiddleware(300),
  findDepartmentByUserId,
);
orgunitRouter.get(
  '/user/:userId/directie',
  cacheMiddleware(300),
  getUserDirectie,
);
orgunitRouter.get(
  '/subordonati/count',
  cacheMiddleware(300),
  getDepartmentCount,
);
orgunitRouter.get(
  '/subordonati/:id/subtree',
  cacheMiddleware(300),
  getDirectionSubtree,
);
orgunitRouter.get('/subordonati/:id', cacheMiddleware(300), getSubordonati);

export default orgunitRouter;
