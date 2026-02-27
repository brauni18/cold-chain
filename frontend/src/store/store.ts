import { configureStore } from '@reduxjs/toolkit';
import temperatureReducer from './itemsSlice.js';

export const store = configureStore({
  reducer: {
    temperature: temperatureReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
