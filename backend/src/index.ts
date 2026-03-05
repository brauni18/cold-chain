import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { temperatureRoutes } from './routes/temperatureRoutes';
import { errorHandler, notFound } from './utils';

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
try{
  console.log('Hit index - Setting up routes...');
  app.use('/api/temperature', temperatureRoutes);
}
catch(error){
  console.error('Error setting up routes:', error);
}


// Error handling
app.use(notFound);
app.use(errorHandler);

// Database & start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



export default app;
