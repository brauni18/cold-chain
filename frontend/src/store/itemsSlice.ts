import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SensorReading, SensorHistoryPoint } from '../types/index.js';
import { authFetch } from '../utils/api.js';

interface TemperatureState {
  sensors: SensorReading[];
  history: SensorHistoryPoint[];
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

const initialState: TemperatureState = {
  sensors: [],
  history: [],
  loading: false,
  historyLoading: false,
  error: null,
  lastUpdate: null,
};

export const fetchSensorData = createAsyncThunk('temperature/fetchSensors', async () => {
  const res = await authFetch('/api/temperature/latest');
  if (!res.ok) throw new Error('Failed to fetch sensor data');
  return (await res.json()) as SensorReading[];
});

export const fetchTemperatureHistory = createAsyncThunk('temperature/fetchHistory', async () => {
  const res = await authFetch('/api/temperature/history');
  if (!res.ok) throw new Error('Failed to fetch history');
  return (await res.json()) as SensorHistoryPoint[];
});

export const renameDevice = createAsyncThunk(
  'temperature/renameDevice',
  async ({ tenantId, name }: { tenantId: string; name: string }) => {
    const res = await authFetch(`/api/devices/${tenantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to rename device');
    return { tenantId, name };
  },
);

const temperatureSlice = createSlice({
  name: 'temperature',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensorData.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSensorData.fulfilled, (state, action) => {
        state.loading = false;
        state.sensors = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchSensorData.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Error'; })
      .addCase(fetchTemperatureHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchTemperatureHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
      .addCase(fetchTemperatureHistory.rejected, (state) => { state.historyLoading = false; })
      // Rename device — update deviceName on all sensors belonging to that tenant
      .addCase(renameDevice.fulfilled, (state, action: PayloadAction<{ tenantId: string; name: string }>) => {
        for (const sensor of state.sensors) {
          if (sensor.tenantId === action.payload.tenantId) {
            sensor.deviceName = action.payload.name;
          }
        }
      });
  },
});

export default temperatureSlice.reducer;
