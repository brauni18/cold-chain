import { Request, Response } from 'express';
import {
  putItem,
  getItem,
  deleteItem,
  updateItem,
  queryByPartition,
  ENTITIES_TABLE,
} from '../db/dynamodb.js';
import type { ApiResponse, SensorEntity } from '../types/index.js';

// ── POST /api/sensors ──────────────────────────────────

export const createSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, deviceId, name, location, minThreshold, maxThreshold } = req.body;

    if (!sensorId || !deviceId) {
      res.status(400).json({ success: false, message: 'sensorId and deviceId are required' });
      return;
    }

    const now = new Date().toISOString();
    const item = {
      PK: `SENSOR#${sensorId}`,
      SK: 'PROFILE',
      sensorId,
      deviceId,
      name: name ?? sensorId,
      location: location ?? '',
      minThreshold: minThreshold ?? null,
      maxThreshold: maxThreshold ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(ENTITIES_TABLE, item);

    // Also create the reverse mapping: DEVICE#x → SENSOR#y
    await putItem(ENTITIES_TABLE, {
      PK: `DEVICE#${deviceId}`,
      SK: `SENSOR#${sensorId}`,
      sensorId,
      linkedAt: now,
    });

    const response: ApiResponse<SensorEntity> = {
      success: true,
      data: { sensorId, deviceId, name: item.name, location: item.location, minThreshold, maxThreshold, createdAt: now, updatedAt: now },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('createSensor error:', error);
    res.status(500).json({ success: false, message: 'Failed to create sensor' });
  }
};

// ── GET /api/sensors/:id ───────────────────────────────

export const getSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await getItem(ENTITIES_TABLE, { PK: `SENSOR#${id}`, SK: 'PROFILE' });

    if (!item) {
      res.status(404).json({ success: false, message: 'Sensor not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('getSensor error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sensor' });
  }
};

// ── PUT /api/sensors/:id ───────────────────────────────

export const updateSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, location, minThreshold, maxThreshold } = req.body;

    const fields: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) fields.name = name;
    if (location !== undefined) fields.location = location;
    if (minThreshold !== undefined) fields.minThreshold = minThreshold;
    if (maxThreshold !== undefined) fields.maxThreshold = maxThreshold;

    const result = await updateItem(
      ENTITIES_TABLE,
      { PK: `SENSOR#${id}`, SK: 'PROFILE' },
      fields,
    );

    res.json({ success: true, data: result.Attributes });
  } catch (error) {
    console.error('updateSensor error:', error);
    res.status(500).json({ success: false, message: 'Failed to update sensor' });
  }
};

// ── DELETE /api/sensors/:id ────────────────────────────

export const deleteSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get the sensor to find its deviceId for cleanup
    const item = await getItem(ENTITIES_TABLE, { PK: `SENSOR#${id}`, SK: 'PROFILE' });

    // Delete the sensor profile
    await deleteItem(ENTITIES_TABLE, { PK: `SENSOR#${id}`, SK: 'PROFILE' });

    // Delete the device→sensor mapping if we know the deviceId
    if (item?.deviceId) {
      await deleteItem(ENTITIES_TABLE, { PK: `DEVICE#${item.deviceId}`, SK: `SENSOR#${id}` });
    }

    res.json({ success: true, message: 'Sensor deleted' });
  } catch (error) {
    console.error('deleteSensor error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete sensor' });
  }
};

// ── GET /api/sensors (list all) ────────────────────────

export const listSensors = async (_req: Request, res: Response): Promise<void> => {
  try {
    // For now, scan-based. In production, scope by user→device→sensors.
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    const { docClient } = await import('../db/dynamodb.js');

    const result = await docClient.send(new ScanCommand({
      TableName: ENTITIES_TABLE,
      FilterExpression: 'SK = :profile AND begins_with(PK, :prefix)',
      ExpressionAttributeValues: { ':profile': 'PROFILE', ':prefix': 'SENSOR#' },
    }));

    res.json({ success: true, data: result.Items ?? [] });
  } catch (error) {
    console.error('listSensors error:', error);
    res.status(500).json({ success: false, message: 'Failed to list sensors' });
  }
};

// ── GET /api/devices/:deviceId/sensors ─────────────────

export const listSensorsForDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;
    const items = await queryByPartition(ENTITIES_TABLE, 'PK', `DEVICE#${deviceId}`, 'SK', 'SENSOR#');

    // Enrich with full sensor profiles
    const sensors = await Promise.all(
      items.map(async (mapping) => {
        const profile = await getItem(ENTITIES_TABLE, {
          PK: `SENSOR#${mapping.sensorId}`,
          SK: 'PROFILE',
        });
        return profile ?? mapping;
      }),
    );

    res.json({ success: true, data: sensors });
  } catch (error) {
    console.error('listSensorsForDevice error:', error);
    res.status(500).json({ success: false, message: 'Failed to list sensors for device' });
  }
};