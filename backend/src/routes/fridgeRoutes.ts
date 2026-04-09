import { Router } from 'express';
import {
  createFridge,
  getFridge,
  updateFridge,
  deleteFridge,
  listFridges,
} from '../controllers/fridgeController.js';
import { listSensorsForFridge } from '../controllers/sensorController.js';

export const fridgeRoutes = Router();

fridgeRoutes.get('/', listFridges);
fridgeRoutes.post('/', createFridge);
fridgeRoutes.get('/:id', getFridge);
fridgeRoutes.put('/:id', updateFridge);
fridgeRoutes.delete('/:id', deleteFridge);
fridgeRoutes.get('/:fridgeId/sensors', listSensorsForFridge);