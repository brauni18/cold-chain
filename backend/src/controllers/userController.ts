import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  putItem,
  getItem,
  deleteItem,
  updateItem,
  ENTITIES_TABLE,
} from '../db/dynamodb.js';
import type { ApiResponse, UserEntity } from '../types/index.js';

// ── POST /api/users ────────────────────────────────────

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      res.status(400).json({ success: false, message: 'email and name are required' });
      return;
    }

    const userId = randomUUID();
    const now = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      userId,
      email,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(ENTITIES_TABLE, item);

    const response: ApiResponse<UserEntity> = {
      success: true,
      data: { userId, email, name, createdAt: now, updatedAt: now },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

// ── GET /api/users/:id ─────────────────────────────────

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await getItem(ENTITIES_TABLE, { PK: `USER#${id}`, SK: 'PROFILE' });

    if (!item) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('getUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

// ── PUT /api/users/:id ─────────────────────────────────

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    const fields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (email !== undefined) fields.email = email;
    if (name !== undefined) fields.name = name;

    const result = await updateItem(
      ENTITIES_TABLE,
      { PK: `USER#${id}`, SK: 'PROFILE' },
      fields,
    );

    res.json({ success: true, data: result.Attributes });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// ── DELETE /api/users/:id ──────────────────────────────

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteItem(ENTITIES_TABLE, { PK: `USER#${id}`, SK: 'PROFILE' });
    // Note: does NOT cascade-delete fridges. Handle in a future cleanup job.
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};