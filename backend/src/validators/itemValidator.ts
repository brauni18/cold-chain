import { IItem } from '../types/index.js';

export function validateItem(data: Partial<IItem>): string[] {
  const errors: string[] = [];
  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }
  return errors;
}
