import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SensorReading, SensorHistoryPoint } from '../types/index.js';

interface SensorCardProps {
  sensor: SensorReading;
  history: SensorHistoryPoint[];
}

export function SensorCard({ sensor, history }: SensorCardProps) {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = history.filter((p) => new Date(p.time).getTime() > oneDayAgo);

  // Compute min/max for the 24h window
  const temps = recent.map((p) => p.temp);
  const min = temps.length ? Math.min(...temps) : 0;
  const max = temps.length ? Math.max(...temps) : 0;
  const avg = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

  return (
    <div className="bg-card-gradient rounded-xl border border-navy-700/50 hover:border-cyan-400/30 transition-all duration-300 shadow-card overflow-hidden group">
      {/* Header bar */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-600 bg-navy-700/50 px-2 py-0.5 rounded">
            {sensor.sensorId}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Online</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green animate-pulse" />
        </div>
      </div>

      {/* Name + location */}
      <div className="px-5 pb-3">
        <h3 className="text-base font-semibold text-white">{sensor.location}</h3>
      </div>

      {/* Temperature display */}
      <div className="px-5 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Current</p>
            <p className="text-4xl font-bold text-cyan-400 text-glow-cyan tabular-nums leading-none">
              {sensor.temp.toFixed(1)}<span className="text-lg text-cyan-400/70 ml-0.5">°C</span>
            </p>
          </div>
          {/* 24h stats */}
          <div className="text-right space-y-0.5">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-600">▲ High</span>
              <span className="text-xs text-gray-400 font-mono tabular-nums">{max.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-600">μ Avg</span>
              <span className="text-xs text-gray-400 font-mono tabular-nums">{avg.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-600">▼ Low</span>
              <span className="text-xs text-gray-400 font-mono tabular-nums">{min.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline area chart */}
      <div className="px-3 pb-1 mt-2">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1 px-2">Last 24 hours</p>
        <div className="rounded-lg overflow-hidden bg-navy-950/50 p-1">
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={recent} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={`grad-${sensor.sensorId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#00e5ff"
                strokeWidth={1.5}
                fill={`url(#grad-${sensor.sensorId})`}
                dot={false}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-navy-700/30 flex items-center justify-between">
        <p className="text-[10px] text-gray-600">
          Updated {new Date(sensor.time).toLocaleTimeString()}
        </p>
        <p className="text-[10px] text-gray-600 font-mono">
          {recent.length} readings
        </p>
      </div>
    </div>
  );
}