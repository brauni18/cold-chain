export interface SensorReading {
  sensorId: string;
  location: string;
  temp: number;
  time: string;
  unit: string;
}

export interface SensorHistoryPoint {
  sensorId: string;
  time: string;
  temp: number;
}

// Keep for backward compat
export interface TemperatureReading {
  temp: number;
  time: string;
  unit: string;
}

export interface TemperatureHistoryPoint {
  time: string;
  temp: number;
}