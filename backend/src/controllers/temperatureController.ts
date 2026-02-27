import { Request, Response } from 'express';
import { InfluxDB } from '@influxdata/influxdb-client';

const token = process.env.INFLUXDB_TOKEN as string;
const org = process.env.INFLUXDB_ORG as string;
const bucket = process.env.INFLUXDB_BUCKET as string;
const url = process.env.INFLUXDB_URL as string;

export const getLatestTemperature = async (_req: Request, res: Response): Promise<void> => {
  console.log('→ getLatestTemperature called');

  const fluxQuery = `
    from(bucket: "${bucket}")
  |> range(start: -7d)
  |> filter(fn: (r) => r._field == "celsius")
  |> last()
  `;

  let data: Record<string, unknown> = {};
  let hasError = false;

  try {
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    await queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        data = tableMeta.toObject(row);
        console.log('✅ Data received:', data);
      },
      error(e) {
        hasError = true;
        console.error('❌ InfluxDB Error:', e.message);
        if (!res.headersSent) {
          res.status(500).json({ error: e.message });
        }
      },
      complete() {
        if (!hasError && !res.headersSent) {
          if (data && data._value !== undefined) {
            console.log('✅ Sending to frontend:', data);
            res.json({ temp: data._value, time: data._time, unit: 'Celsius' });
          } else {
            console.log('⚠️ No data found');
            res.status(404).json({ error: 'No data found' });
          }
        }
      },
    });
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Server Error');
    }
  }
};
