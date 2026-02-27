import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TemperatureReading } from '../types/index.js';

interface TemperatureState {
  data: TemperatureReading | null;
  loading: boolean;
  error: string | null;
}

const initialState: TemperatureState = { data: null, loading: false, error: null };

export const fetchLatestTemperature = createAsyncThunk('temperature/fetchLatest', async () => {
  const res = await fetch('/api/temperature/latest');
  if (!res.ok) throw new Error('Failed to fetch temperature');
  return (await res.json()) as TemperatureReading;
});

const temperatureSlice = createSlice({
  name: 'temperature',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestTemperature.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLatestTemperature.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
      .addCase(fetchLatestTemperature.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Error'; });
  },
});

export default temperatureSlice.reducer;
