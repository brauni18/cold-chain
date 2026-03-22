import { Router } from 'express';
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { listFridgesForUser } from '../controllers/fridgeController.js';

export const userRoutes = Router();

userRoutes.post('/', createUser);
userRoutes.get('/:id', getUser);
userRoutes.put('/:id', updateUser);
userRoutes.delete('/:id', deleteUser);
userRoutes.get('/:userId/fridges', listFridgesForUser);