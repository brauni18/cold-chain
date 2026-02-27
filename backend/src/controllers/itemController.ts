import { Request, Response, NextFunction } from 'express';
import { Item } from '../models/Item.js';
import { validateItem } from '../validators/itemValidator.js';

export async function getItems(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validateItem(req.body);
    if (errors.length > 0) {
      res.status(400).json({ success: false, message: errors.join(', ') });
      return;
    }
    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
}
