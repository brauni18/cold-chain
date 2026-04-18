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
import type { ApiResponse, DeviceEntity } from '../types/index.js';

// ── POST /api/devices ──────────────────────────────────

export const createDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, userId } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'name is required' });
      return;
    }

    const deviceId = randomUUID();
    const now = new Date().toISOString();
    const owner = userId ?? 'default-user';

    const item = {
      PK: `DEVICE#${deviceId}`,
      SK: 'PROFILE',
      deviceId,
      userId: owner,
      name,
      location: location ?? '',
      createdAt: now,
      updatedAt: now,
    };

    await putItem(ENTITIES_TABLE, item);

    // Create user→device mapping
    await putItem(ENTITIES_TABLE, {
      PK: `USER#${owner}`,
      SK: `DEVICE#${deviceId}`,
      deviceId,
      linkedAt: now,
    });

    const response: ApiResponse<DeviceEntity> = {
      success: true,
      data: { deviceId, userId: owner, name, location: item.location, createdAt: now, updatedAt: now },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('createDevice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create device' });
  }
};

// ── GET /api/devices/:id ───────────────────────────────

export const getDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await getItem(ENTITIES_TABLE, { PK: `DEVICE#${id}`, SK: 'PROFILE' });

    if (!item) {
      res.status(404).json({ success: false, message: 'Device not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('getDevice error:', error);
    res.status(500).json({ success: false, message: 'Failed to get device' });
  }
};

// ── PUT /api/devices/:id ───────────────────────────────

export const updateDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const fields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) fields.name = name;
    if (location !== undefined) fields.location = location;

    const result = await updateItem(
      ENTITIES_TABLE,
      { PK: `DEVICE#${id}`, SK: 'PROFILE' },
      fields,
    );

    res.json({ success: true, data: result.Attributes });
  } catch (error) {
    console.error('updateDevice error:', error);
    res.status(500).json({ success: false, message: 'Failed to update device' });
  }
};

// ── DELETE /api/devices/:id ────────────────────────────

export const deleteDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get device to find owner for mapping cleanup
    const item = await getItem(ENTITIES_TABLE, { PK: `DEVICE#${id}`, SK: 'PROFILE' });

    // Delete the device profile
    await deleteItem(ENTITIES_TABLE, { PK: `DEVICE#${id}`, SK: 'PROFILE' });

    // Delete user→device mapping
    if (item?.userId) {
      await deleteItem(ENTITIES_TABLE, { PK: `USER#${item.userId}`, SK: `DEVICE#${id}` });
    }

    // Note: sensors linked to this device are NOT auto-deleted.
    // The caller should reassign or delete sensors separately.

    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    console.error('deleteDevice error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete device' });
  }
};

// ── GET /api/devices (list all) ────────────────────────

export const listDevices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const { docClient } = await import('../db/dynamodb.js');

    const result = await docClient.send(new ScanCommand({
      TableName: ENTITIES_TABLE,
      FilterExpression: 'SK = :profile AND begins_with(PK, :prefix)',
      ExpressionAttributeValues: { ':profile': 'PROFILE', ':prefix': 'DEVICE#' },
    }));

    res.json({ success: true, data: result.Items ?? [] });
  } catch (error) {
    console.error('listDevices error:', error);
    res.status(500).json({ success: false, message: 'Failed to list devices' });
  }
};

// ── GET /api/users/:userId/devices ─────────────────────

export const listDevicesForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const items = await queryByPartition(ENTITIES_TABLE, 'PK', `USER#${userId}`, 'SK', 'DEVICE#');

    // Enrich with full device profiles
    const devices = await Promise.all(
      items.map(async (mapping) => {
        const profile = await getItem(ENTITIES_TABLE, {
          PK: `DEVICE#${mapping.deviceId}`,
          SK: 'PROFILE',
        });
        return profile ?? mapping;
      }),
    );

    res.json({ success: true, data: devices });
  } catch (error) {
    console.error('listDevicesForUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to list devices for user' });
  }
};
