import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { temperatureRoutes } from './routes/temperatureRoutes.js';
import { sensorRoutes } from './routes/sensorRoutes.js';
import { fridgeRoutes } from './routes/fridgeRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { errorHandler, notFound } from './utils.js';

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/temperature', temperatureRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/fridges', fridgeRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
