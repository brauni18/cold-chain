import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { SensorReading, SensorHistoryPoint } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';
import { useAppDispatch } from '../store/hooks.js';
import { renameDevice } from '../store/itemsSlice.js';

// Sensor-row colors for multi-sensor sparklines
const SENSOR_COLORS = ['#00e5ff', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];
const SENSOR_COLORS_LIGHT = ['#0891b2', '#7c3aed', '#059669', '#d97706', '#dc2626', '#2563eb'];

interface DeviceCardProps {
  tenantId: string;
  sensors: SensorReading[];
  history: SensorHistoryPoint[];
}

export function DeviceCard({ tenantId, sensors, history }: DeviceCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dispatch = useAppDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deviceName = sensors[0]?.deviceName ?? tenantId;

  // Close kebab on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // ── Aggregate stats across all sensors ──
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentHistory = history.filter((p) => new Date(p.time).getTime() > oneDayAgo);
  const allTemps = recentHistory.map((p) => p.temp);
  const min = allTemps.length ? Math.min(...allTemps) : 0;
  const max = allTemps.length ? Math.max(...allTemps) : 0;
  const avg = allTemps.length ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length : 0;

  // Latest update across all sensors
  const latestTime = sensors.reduce((latest, s) => {
    const t = new Date(s.time).getTime();
    return t > latest ? t : latest;
  }, 0);

  // ── Handlers ──
  function handleEditClick() {
    setMenuOpen(false);
    setEditName(deviceName);
    setIsEditing(true);
  }

  function handleSaveName() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== deviceName) {
      dispatch(renameDevice({ tenantId, name: trimmed }));
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') setIsEditing(false);
  }

  // ── Build sparkline data: merge all sensors by time ──
  const sensorIds = sensors.map((s) => s.sensorId);
  const colors = isDark ? SENSOR_COLORS : SENSOR_COLORS_LIGHT;

  const timeMap = new Map<string, Record<string, unknown>>();
  for (const p of recentHistory) {
    const key = p.time;
    if (!timeMap.has(key)) timeMap.set(key, { time: key });
    timeMap.get(key)![p.sensorId] = p.temp;
  }
  const sparkData = [...timeMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, row]) => row);

  const gradientId = `grad-device-${tenantId}`;

  return (
    <div className="bg-card-gradient-light dark:bg-card-gradient rounded-xl border border-gray-200 dark:border-navy-700/50 hover:border-cyan-400/30 transition-all duration-300 shadow-card-light dark:shadow-card overflow-hidden group">

      {/* ── Header: tenant ID badge + kebab ── */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-navy-700/50 px-2 py-0.5 rounded">
            {tenantId}
          </span>
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>

        {/* Kebab menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700/50 transition-all"
            aria-label="Device settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700/50 rounded-lg shadow-lg dark:shadow-card py-1 z-50">
              <button
                onClick={handleEditClick}
                className="w-full px-3 py-1.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700/50 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Rename
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

      {/* ── Device name (editable) + Online status ── */}
      <div className="px-5 pb-3 flex items-center justify-between">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            className="text-base font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-cyan-500 outline-none w-48 py-0.5"
            maxLength={40}
          />
        ) : (
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{deviceName}</h3>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium uppercase tracking-wider">Online</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-green animate-pulse" />
        </div>
      </div>

      {/* ── Sensor readings list ── */}
      <div className="px-5 pb-2 space-y-2">
        {sensors.map((sensor, idx) => (
          <div key={sensor.sensorId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[idx % colors.length] }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                {sensor.location || sensor.sensorId}
              </span>
            </div>
            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
              {(sensor.temp ?? 0).toFixed(1)}<span className="text-xs text-cyan-600/70 dark:text-cyan-400/70 ml-0.5">°C</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Aggregate stats ── */}
      <div className="px-5 pb-2 flex items-center justify-end gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-600">▲</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{max.toFixed(1)}°</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-600">μ</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{avg.toFixed(1)}°</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-600">▼</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">{min.toFixed(1)}°</span>
        </div>
      </div>

      {/* ── Sparkline chart (one line per sensor) ── */}
      <div className="px-3 pb-1 mt-1">
        <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1 px-2">Last 24 hours</p>
        <div className="rounded-lg overflow-hidden bg-gray-50 dark:bg-navy-950/50 p-1">
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={sparkData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                {sensorIds.map((sid, idx) => (
                  <linearGradient key={sid} id={`${gradientId}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors[idx % colors.length]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={colors[idx % colors.length]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
              {sensorIds.map((sid, idx) => (
                <Area
                  key={sid}
                  type="monotone"
                  dataKey={sid}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={1.5}
                  fill={`url(#${gradientId}-${idx})`}
                  dot={false}
                  animationDuration={800}
                  connectNulls
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-2.5 border-t border-gray-100 dark:border-navy-700/30 flex items-center justify-between">
        <p className="text-[10px] text-gray-400 dark:text-gray-600">
          Updated {latestTime ? new Date(latestTime).toLocaleTimeString() : '—'}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 font-mono">
          {sensors.length} sensor{sensors.length !== 1 ? 's' : ''} · {recentHistory.length} readings
        </p>
      </div>
    </div>
  );
}
