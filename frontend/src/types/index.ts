export interface Item {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureReading {
  temp: number;
  time: string;
  unit: string;
}
