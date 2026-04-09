import { Router } from 'express';
import {
  getLatestTemperature,
  getTemperatureHistory,
  createReading,
  deleteReading,
} from '../controllers/temperatureController.js';

export const temperatureRoutes = Router();

try {
  console.log('Setting up temperature routes...');
  temperatureRoutes.get('/latest', getLatestTemperature);
  temperatureRoutes.get('/history', getTemperatureHistory);
  temperatureRoutes.post('/', createReading);
  temperatureRoutes.delete('/:sensorId/:timestamp', deleteReading);
} catch (error) {
  console.error('Error setting up temperature routes:', error);
}
