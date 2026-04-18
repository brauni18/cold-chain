import { Request, Response } from 'express';
import {
  queryReadings,
  discoverSensorIds,
  putItem,
  deleteItem,
  getItem,
  READINGS_TABLE,
} from '../db/dynamodb.js';
import {
  queryByPartition,
  ENTITIES_TABLE,
} from '../db/dynamodb.js';
import type { LatestSensorResponse, HistoryPointResponse } from '../types/index.js';

// ── Cache device names to avoid repeated lookups within a request ──

async function resolveDeviceName(tenantId: string, cache: Map<string, string>): Promise<string> {
  if (cache.has(tenantId)) return cache.get(tenantId)!;

  let name = tenantId; // fallback = hostname
  try {
    const item = await getItem(ENTITIES_TABLE, { PK: `DEVICE#${tenantId}`, SK: 'PROFILE' });
    if (item?.name) name = item.name as string;
  } catch {
    // entities table may not exist yet — graceful fallback
  }
  cache.set(tenantId, name);
  return name;
}

// ── GET /api/temperature/latest ────────────────────────

export const getLatestTemperature = async (_req: Request, res: Response): Promise<void> => {
  console.log('→ getLatestTemperature called');

  try {
    // 1. Find all known sensor IDs (scan while small; later use entities table)
    const sensorIds = await discoverSensorIds();

    // 2. For each sensor, grab the single most-recent reading
    const sensors: LatestSensorResponse[] = [];
    const deviceNameCache = new Map<string, string>();

    await Promise.all(
      sensorIds.map(async (sensorId) => {
        const items = await queryReadings(sensorId, { limit: 1 }); // newest first
        if (items.length === 0) return;
        const r = items[0];

        console.log('🔍 Raw DynamoDB item:', JSON.stringify(r));

        // Try to get a friendly location from the entities table
        let location = sensorId; // fallback
        try {
          const entityItems = await queryByPartition(
            ENTITIES_TABLE, 'PK', `SENSOR#${sensorId}`, 'SK', 'PROFILE',
          );
          if (entityItems.length > 0 && entityItems[0].location) {
            location = entityItems[0].location as string;
          }
        } catch {
          // entities table may not exist yet — graceful fallback
        }

        const tenantId = (r.tenantId as string) ?? 'unknown';
        const deviceName = await resolveDeviceName(tenantId, deviceNameCache);

        sensors.push({
          sensorId,
          tenantId,
          deviceName,
          location: (r.location as string) ?? location,
          temp: Number(r.celsius ?? r.value),
          time: r.timestamp as string,
          unit: 'Celsius',
        });
      }),
    );

    console.log(`✅ Sending ${sensors.length} sensor readings`);
    res.json(sensors);
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to fetch latest temperatures' });
  }
};

// ── GET /api/temperature/history ───────────────────────

export const getTemperatureHistory = async (req: Request, res: Response): Promise<void> => {
  console.log('→ getTemperatureHistory called');

  try {
    const days = Number(req.query.days) || 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Optionally filter to a single sensor
    const requestedSensor = req.query.sensorId as string | undefined;
    const sensorIds = requestedSensor ? [requestedSensor] : await discoverSensorIds();

    const data: HistoryPointResponse[] = [];

    await Promise.all(
      sensorIds.map(async (sensorId) => {
        const items = await queryReadings(sensorId, { from, ascending: true });
        for (const r of items) {
          data.push({
            sensorId,
            time: r.timestamp as string,
            temp: Number(r.celsius ?? r.value),           // same fix
          });
        }
      }),
    );

    // Sort ascending by time (across all sensors)
    data.sort((a, b) => a.time.localeCompare(b.time));

    console.log(`✅ Sending ${data.length} history points`);
    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to fetch temperature history' });
  }
};

// ── POST /api/temperature ──────────────────────────────

export const createReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, value, fahrenheit, tenantId, status } = req.body;

    if (!sensorId || value === undefined) {
      res.status(400).json({ success: false, message: 'sensorId and value are required' });
      return;
    }

    const now = new Date().toISOString();
    const ttl = Math.floor(Date.now() / 1000) + 7776000; // 90 days

    const item = {
      sensorId,
      timestamp: now,
      tenantId: tenantId ?? 'api',
      sensorType: 'temperature',
      measure: 'celsius',
      value: Number(value),
      fahrenheit: fahrenheit != null ? Number(fahrenheit) : Number(value) * 9 / 5 + 32,
      status: status ?? 'OK',
      ttl,
    };

    await putItem(READINGS_TABLE, item);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Failed to create reading' });
  }
};

// ── DELETE /api/temperature/:sensorId/:timestamp ───────

export const deleteReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId, timestamp } = req.params;

    if (!sensorId || !timestamp) {
      res.status(400).json({ success: false, message: 'sensorId and timestamp are required' });
      return;
    }

    await deleteItem(READINGS_TABLE, { sensorId, timestamp });
    res.json({ success: true, message: 'Reading deleted' });
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'Failed to delete reading' });
  }
};