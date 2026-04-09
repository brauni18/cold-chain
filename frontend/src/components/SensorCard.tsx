import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SensorReading, SensorHistoryPoint } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';

interface SensorCardProps {
  sensor: SensorReading;
  history: SensorHistoryPoint[];
}

export function SensorCard({ sensor, history }: SensorCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = history.filter((p) => new Date(p.time).getTime() > oneDayAgo);

  const temps = recent.map((p) => p.temp);
  const min = temps.length ? Math.min(...temps) : 0;
  const max = temps.length ? Math.max(...temps) : 0;
  const avg = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

  const strokeColor = isDark ? '#00e5ff' : '#0891b2';
  const gradientId = `grad-${sensor.sensorId}`;

  return (
    <div className="bg-card-gradient-light dark:bg-card-gradient rounded-xl border border-gray-200 dark:border-navy-700/50 hover:border-cyan-400/30 transition-all duration-300 shadow-card-light dark:shadow-card overflow-hidden group">
      {/* Header bar — sensor ID + kebab */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-navy-700/50 px-2 py-0.5 rounded">
            {sensor.sensorId}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>

        {/* Kebab menu — always visible */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700/50 transition-all"
            aria-label="Sensor settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700/50 rounded-lg shadow-lg dark:shadow-card py-1 z-50">
              <button className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Edit
              </button>
              <button className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Name + Online status — same row */}
      <div className="px-5 pb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{sensor.location}</h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium uppercase tracking-wider">Online</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green animate-pulse" />
        </div>
      </div>

      {/* Temperature display */}
      <div className="px-5 pb-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Current</p>
            <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 dark:text-glow-cyan tabular-nums leading-none">
              {(sensor.temp ?? 0).toFixed(1)}<span className="text-lg text-cyan-600/70 dark:text-cyan-400/70 ml-0.5">°C</span>
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-600">▲ High</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{max.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-600">μ Avg</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{avg.toFixed(1)}°</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-600">▼ Low</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{min.toFixed(1)}°</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkline area chart */}
      <div className="px-3 pb-1 mt-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1 px-2">Last 24 hours</p>
        <div className="rounded-lg overflow-hidden bg-gray-50 dark:bg-navy-950/50 p-1">
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={recent} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={strokeColor}
                strokeWidth={1.5}
                fill={`url(#${gradientId})`}
                dot={false}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-gray-100 dark:border-navy-700/30 flex items-center justify-between">
        <p className="text-[10px] text-gray-400 dark:text-gray-600">
          Updated {new Date(sensor.time).toLocaleTimeString()}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
          {recent.length} readings
        </p>
      </div>
    </div>
  );
}