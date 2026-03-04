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
    |> group(columns: ["sensor_id", "location"])
    |> last()
  `;

  const sensors: { sensorId: string; location: string; temp: number; time: string; unit: string }[] = [];
  let hasError = false;

  try {
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    await queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const r = tableMeta.toObject(row);
        sensors.push({
          sensorId: r.sensor_id as string,
          location: r.location as string,
          temp: r._value as number,
          time: r._time as string,
          unit: 'Celsius',
        });
      },
      error(e) {
        hasError = true;
        console.error('❌ InfluxDB Error:', e.message);
        if (!res.headersSent) res.status(500).json({ error: e.message });
      },
      complete() {
        if (!hasError && !res.headersSent) {
          console.log(`✅ Sending ${sensors.length} sensor readings`);
          res.json(sensors);
        }
      },
    });
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).send('Server Error');
  }
};

export const getTemperatureHistory = async (_req: Request, res: Response): Promise<void> => {
  console.log('→ getTemperatureHistory called');

  const fluxQuery = `
    from(bucket: "${bucket}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._field == "celsius")
    |> sort(columns: ["_time"], desc: false)
  `;

  const data: { sensorId: string; time: string; temp: number }[] = [];
  let hasError = false;

  try {
    const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    await queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const r = tableMeta.toObject(row);
        data.push({
          sensorId: r.sensor_id as string,
          time: r._time as string,
          temp: r._value as number,
        });
      },
      error(e) {
        hasError = true;
        console.error('❌ InfluxDB Error:', e.message);
        if (!res.headersSent) res.status(500).json({ error: e.message });
      },
      complete() {
        if (!hasError && !res.headersSent) {
          console.log(`✅ Sending ${data.length} history points`);
          res.json(data);
        }
      },
    });
  } catch (error) {
    console.error('Server Error:', error);
    if (!res.headersSent) res.status(500).send('Server Error');
  }
};