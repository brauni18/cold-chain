import { Router } from 'express';
import {
  createDevice,
  getDevice,
  updateDevice,
  deleteDevice,
  listDevices,
} from '../controllers/deviceController.js';
import { listSensorsForDevice } from '../controllers/sensorController.js';

export const deviceRoutes = Router();

deviceRoutes.get('/', listDevices);
deviceRoutes.post('/', createDevice);
deviceRoutes.get('/:id', getDevice);
deviceRoutes.put('/:id', updateDevice);
deviceRoutes.delete('/:id', deleteDevice);
deviceRoutes.get('/:deviceId/sensors', listSensorsForDevice);
