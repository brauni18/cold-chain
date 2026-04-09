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

// ── Auth types ──

export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, name: string, phone: string) => Promise<void>;
  confirmSignup: (username: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}