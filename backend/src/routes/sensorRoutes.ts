import { Router } from 'express';
import {
  createSensor,
  getSensor,
  updateSensor,
  deleteSensor,
  listSensors,
} from '../controllers/sensorController.js';

export const sensorRoutes = Router();

sensorRoutes.get('/', listSensors);
sensorRoutes.post('/', createSensor);
sensorRoutes.get('/:id', getSensor);
sensorRoutes.put('/:id', updateSensor);
sensorRoutes.delete('/:id', deleteSensor);