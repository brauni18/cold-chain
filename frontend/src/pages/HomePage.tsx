import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { fetchSensorData, fetchTemperatureHistory } from '../store/itemsSlice.js';
import { StatusBar } from '../components/StatusBar.js';
import { DeviceCard } from '../components/DeviceCard.js';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { sensors, history, loading, error, lastUpdate } = useAppSelector((s) => s.temperature);

  useEffect(() => {
    dispatch(fetchSensorData());
    dispatch(fetchTemperatureHistory());
    const interval = setInterval(() => {
      dispatch(fetchSensorData());
      dispatch(fetchTemperatureHistory());
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Group sensors by tenantId (= device)
  const deviceMap = useMemo(() => {
    const map = new Map<string, typeof sensors>();
    for (const s of sensors) {
      const key = s.tenantId ?? 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sensors]);

  const deviceCount = deviceMap.size;
  const totalSensors = sensors.length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
        {lastUpdate && (
          <div className="bg-white dark:bg-card-gradient border border-gray-200 dark:border-navy-700/50 rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm dark:shadow-card">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
            <span className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Last update</span>
            <span className="text-sm text-cyan-600 dark:text-cyan-400 font-mono dark:text-glow-cyan tabular-nums">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading && sensors.length === 0 ? (
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 py-12 justify-center">
          <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm">Loading sensor data...</p>
        </div>
      ) : (
        <>
          <StatusBar total={deviceCount} online={deviceCount} normal={deviceCount} warning={0} critical={0} />

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-gradient-to-b from-cyan-500 dark:from-cyan-400 to-cyan-500/30 dark:to-cyan-400/30 rounded-full" />
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Devices
              </h2>
              <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">({deviceCount})</span>
              <span className="text-xs text-gray-400 dark:text-gray-600 ml-1">· {totalSensors} sensor{totalSensors !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...deviceMap.entries()].map(([tid, deviceSensors]) => (
                <DeviceCard
                  key={tid}
                  tenantId={tid}
                  sensors={deviceSensors}
                  history={history.filter((h) =>
                    deviceSensors.some((s) => s.sensorId === h.sensorId),
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
