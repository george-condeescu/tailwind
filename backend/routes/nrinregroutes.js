import express from 'express';

import {
  createNrinreg,
  getAllNrinreg,
  getNrinregByDepartamentAndYear,
  deleteNrinreg,
} from '../controllers/nrInregcontrollers.js';

const nrinregRouter = express.Router();

nrinregRouter.post('/', createNrinreg); //ok
nrinregRouter.get('/', getAllNrinreg); //ok
nrinregRouter.get('/:departament/:year', getNrinregByDepartamentAndYear); //ok
nrinregRouter.put('/', createNrinreg); //ok
nrinregRouter.delete('/:departament/:year', deleteNrinreg); //ok

export default nrinregRouter;
