import { Router } from 'express';
import { getLatestTemperature } from '../controllers/temperatureController';

export const temperatureRoutes = Router();
try{
    console.log('hit routes - Setting up temperature controller...');
    temperatureRoutes.get('/latest', getLatestTemperature);
}catch(error){
    console.error('Error setting up temperature controller:', error);
}
