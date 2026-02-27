import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';

export const itemRoutes = Router();

itemRoutes.get('/', getItems);
itemRoutes.get('/:id', getItemById);
itemRoutes.post('/', createItem);
itemRoutes.put('/:id', updateItem);
itemRoutes.delete('/:id', deleteItem);
