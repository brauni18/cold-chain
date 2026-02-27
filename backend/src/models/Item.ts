import mongoose, { Document, Schema } from 'mongoose';
import { IItem } from '../types/index.js';

export interface IItemDocument extends IItem, Document {}

const itemSchema = new Schema<IItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Item = mongoose.model<IItemDocument>('Item', itemSchema);
