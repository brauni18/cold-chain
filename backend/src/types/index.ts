export interface IItem {
  name: string;
  description?: string;
}

// ── Reading (from cold-chain-sensors table) ──

export interface SensorReading {
  sensorId: string;
  timestamp: string;          // ISO-8601 (sort key)
  tenantId: string;
  sensorType: string;         // 'temperature'
  measure: string;            // 'celsius'
  value: number;
  fahrenheit: number;
  status: string;             // 'OK' | 'Error'
  ttl: number;                // epoch seconds
}

// ── Entities (cold-chain-entities table) ──

export interface UserEntity {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceEntity {
  deviceId: string;
  userId: string;             // owner
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorEntity {
  sensorId: string;           // DS18B20 address (28-xxxx)
  deviceId: string;
  name: string;
  location: string;           // human-readable label
  minThreshold?: number;
  maxThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

// ── API helpers ──

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ── Frontend-compatible shapes (kept identical to frontend types) ──

export interface LatestSensorResponse {
  sensorId: string;
  tenantId: string;
  deviceName: string;
  location: string;
  temp: number;
  time: string;
  unit: string;
}

export interface HistoryPointResponse {
  sensorId: string;
  time: string;
  temp: number;
}
