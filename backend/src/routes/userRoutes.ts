import { Router } from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { listDevicesForUser } from '../controllers/deviceController.js';

export const userRoutes = Router();

userRoutes.post('/', createUser);
userRoutes.get('/:id', getUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);
userRoutes.get('/:userId/devices', listDevicesForUser);