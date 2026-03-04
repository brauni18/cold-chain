import { Router } from 'express';
import { getLatestTemperature, getTemperatureHistory } from '../controllers/temperatureController';

export const temperatureRoutes = Router();
try{
    console.log('hit routes - Setting up temperature controller...');
    temperatureRoutes.get('/latest', getLatestTemperature);
    temperatureRoutes.get('/history', getTemperatureHistory);
    
}catch(error){
    console.error('Error setting up temperature controller:', error);
}
