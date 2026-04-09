import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import {
  putItem,
  getItem,
  deleteItem,
  updateItem,
  queryByPartition,
  ENTITIES_TABLE,
} from '../db/dynamodb.js';
import type { ApiResponse, FridgeEntity } from '../types/index.js';

// ── POST /api/fridges ──────────────────────────────────

export const createFridge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, userId } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'name is required' });
      return;
    }

    const fridgeId = randomUUID();
    const now = new Date().toISOString();
    const owner = userId ?? 'default-user'; // until auth is implemented

    const item = {
      PK: `FRIDGE#${fridgeId}`,
      SK: 'PROFILE',
      fridgeId,
      userId: owner,
      name,
      location: location ?? '',
      createdAt: now,
      updatedAt: now,
    };

    await putItem(ENTITIES_TABLE, item);

    // Create user→fridge mapping
    await putItem(ENTITIES_TABLE, {
      PK: `USER#${owner}`,
      SK: `FRIDGE#${fridgeId}`,
      fridgeId,
      linkedAt: now,
    });

    const response: ApiResponse<FridgeEntity> = {
      success: true,
      data: { fridgeId, userId: owner, name, location: item.location, createdAt: now, updatedAt: now },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('createFridge error:', error);
    res.status(500).json({ success: false, message: 'Failed to create fridge' });
  }
};

// ── GET /api/fridges/:id ───────────────────────────────

export const getFridge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await getItem(ENTITIES_TABLE, { PK: `FRIDGE#${id}`, SK: 'PROFILE' });

    if (!item) {
      res.status(404).json({ success: false, message: 'Fridge not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('getFridge error:', error);
    res.status(500).json({ success: false, message: 'Failed to get fridge' });
  }
};

// ── PUT /api/fridges/:id ───────────────────────────────

export const updateFridge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const fields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) fields.name = name;
    if (location !== undefined) fields.location = location;

    const result = await updateItem(
      ENTITIES_TABLE,
      { PK: `FRIDGE#${id}`, SK: 'PROFILE' },
      fields,
    );

    res.json({ success: true, data: result.Attributes });
  } catch (error) {
    console.error('updateFridge error:', error);
    res.status(500).json({ success: false, message: 'Failed to update fridge' });
  }
};

// ── DELETE /api/fridges/:id ────────────────────────────

export const deleteFridge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get fridge to find owner for mapping cleanup
    const item = await getItem(ENTITIES_TABLE, { PK: `FRIDGE#${id}`, SK: 'PROFILE' });

    // Delete the fridge profile
    await deleteItem(ENTITIES_TABLE, { PK: `FRIDGE#${id}`, SK: 'PROFILE' });

    // Delete user→fridge mapping
    if (item?.userId) {
      await deleteItem(ENTITIES_TABLE, { PK: `USER#${item.userId}`, SK: `FRIDGE#${id}` });
    }

    // Note: sensors linked to this fridge are NOT auto-deleted.
    // The caller should reassign or delete sensors separately.

    res.json({ success: true, message: 'Fridge deleted' });
  } catch (error) {
    console.error('deleteFridge error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete fridge' });
  }
};

// ── GET /api/fridges (list all) ────────────────────────

export const listFridges = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const { docClient } = await import('../db/dynamodb.js');

    const result = await docClient.send(new ScanCommand({
      TableName: ENTITIES_TABLE,
      FilterExpression: 'SK = :profile AND begins_with(PK, :prefix)',
      ExpressionAttributeValues: { ':profile': 'PROFILE', ':prefix': 'FRIDGE#' },
    }));

    res.json({ success: true, data: result.Items ?? [] });
  } catch (error) {
    console.error('listFridges error:', error);
    res.status(500).json({ success: false, message: 'Failed to list fridges' });
  }
};

// ── GET /api/users/:userId/fridges ─────────────────────

export const listFridgesForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const items = await queryByPartition(ENTITIES_TABLE, 'PK', `USER#${userId}`, 'SK', 'FRIDGE#');

    // Enrich with full fridge profiles
    const fridges = await Promise.all(
      items.map(async (mapping) => {
        const profile = await getItem(ENTITIES_TABLE, {
          PK: `FRIDGE#${mapping.fridgeId}`,
          SK: 'PROFILE',
        });
        return profile ?? mapping;
      }),
    );

    res.json({ success: true, data: fridges });
  } catch (error) {
    console.error('listFridgesForUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to list fridges for user' });
  }
};