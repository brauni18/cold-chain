import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { fetchLatestTemperature } from '../store/itemsSlice.js';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.temperature);

  useEffect(() => {
    dispatch(fetchLatestTemperature());
    const interval = setInterval(() => dispatch(fetchLatestTemperature()), 30_000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Cold Chain Monitor</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-6xl font-bold text-blue-600">{data.temp.toFixed(1)}°{data.unit === 'Celsius' ? 'C' : 'F'}</p>
          <p className="text-gray-500 mt-2">Last reading: {new Date(data.time).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
