import React, { useState, useEffect } from 'react';
import { Clock, Zap, Sun, Moon } from 'lucide-react';

interface WorkingHoursPickerProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

// Convert 24-hour "HH:mm" to 12-hour "h:mm AM/PM"
export function format24To12(time24: string): string {
  if (!time24) return '9:00 AM';
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
  const min = parts[1] || '00';
  if (isNaN(hour)) return '9:00 AM';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${min} ${ampm}`;
}

function parseSingleTimeTo24(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return '09:00';
  let hour = parseInt(match[1], 10);
  const min = match[2] || '00';
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${min}`;
}

export function parseWorkingHours(str?: string): {
  startTime: string;
  endTime: string;
  days: string;
  is24Hours: boolean;
} {
  if (!str) {
    return { startTime: '09:00', endTime: '20:00', days: 'Mon - Sat', is24Hours: false };
  }
  if (/24\s*(hours|\/7)/i.test(str)) {
    return { startTime: '00:00', endTime: '23:59', days: 'All Days (Mon - Sun)', is24Hours: true };
  }

  const daysMatch = str.match(/\(([^)]+)\)/);
  const days = daysMatch ? daysMatch[1].trim() : 'Mon - Sat';

  const timeMatches = str.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/gi);
  let startTime = '09:00';
  let endTime = '20:00';

  if (timeMatches && timeMatches.length >= 2) {
    startTime = parseSingleTimeTo24(timeMatches[0].trim());
    endTime = parseSingleTimeTo24(timeMatches[1].trim());
  }

  return { startTime, endTime, days, is24Hours: false };
}

export const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({
  value,
  onChange,
  compact = false,
}) => {
  const initial = parseWorkingHours(value);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [days, setDays] = useState(initial.days);
  const [is24Hours, setIs24Hours] = useState(initial.is24Hours);

  // Sync state if external value changes significantly
  useEffect(() => {
    const parsed = parseWorkingHours(value);
    setStartTime(parsed.startTime);
    setEndTime(parsed.endTime);
    setDays(parsed.days);
    setIs24Hours(parsed.is24Hours);
  }, [value]);

  const updateHours = (newStart: string, newEnd: string, newDays: string, isAllDay: boolean) => {
    if (isAllDay) {
      onChange('24 Hours / 7 Days Available');
      return;
    }
    const formattedStart = format24To12(newStart);
    const formattedEnd = format24To12(newEnd);
    const finalStr = `${formattedStart} - ${formattedEnd} (${newDays})`;
    onChange(finalStr);
  };

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setIs24Hours(false);
    updateHours(val, endTime, days, false);
  };

  const handleEndChange = (val: string) => {
    setEndTime(val);
    setIs24Hours(false);
    updateHours(startTime, val, days, false);
  };

  const handleDaysChange = (val: string) => {
    setDays(val);
    if (!is24Hours) {
      updateHours(startTime, endTime, val, false);
    }
  };

  const handleToggle24Hours = () => {
    const next = !is24Hours;
    setIs24Hours(next);
    if (next) {
      updateHours(startTime, endTime, days, true);
    } else {
      updateHours(startTime, endTime, days, false);
    }
  };

  const handleApplyPreset = (start: string, end: string, presetDays: string) => {
    setStartTime(start);
    setEndTime(end);
    setDays(presetDays);
    setIs24Hours(false);
    updateHours(start, end, presetDays, false);
  };

  return (
    <div className={`space-y-2.5 ${compact ? 'text-xs' : ''}`}>
      {/* Time Selection Controls */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Opening Time</span>
          </label>
          <div className="relative">
            <input
              type="time"
              disabled={is24Hours}
              value={startTime}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <Moon className="w-3 h-3 text-indigo-500" />
            <span>Closing Time</span>
          </label>
          <div className="relative">
            <input
              type="time"
              disabled={is24Hours}
              value={endTime}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Operating Days & 24/7 Switch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Working Days
          </label>
          <select
            disabled={is24Hours}
            value={days}
            onChange={(e) => handleDaysChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="Mon - Sat">Mon - Sat</option>
            <option value="All Days (Mon - Sun)">All Days (Mon - Sun)</option>
            <option value="Mon - Fri">Mon - Fri (Weekdays)</option>
            <option value="Weekends Only">Weekends Only</option>
          </select>
        </div>

        <div className="pt-4 sm:pt-4">
          <button
            type="button"
            onClick={handleToggle24Hours}
            className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
              is24Hours
                ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${is24Hours ? 'text-white' : 'text-amber-500'}`} />
            <span>{is24Hours ? '✓ 24/7 Non-Stop Active' : 'Enable 24/7 Hours'}</span>
          </button>
        </div>
      </div>

      {/* Popular Fast Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Quick:
        </span>
        <button
          type="button"
          onClick={() => handleApplyPreset('09:00', '20:00', 'Mon - Sat')}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors border border-slate-200/60"
        >
          9 AM - 8 PM (Mon-Sat)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('08:00', '21:00', 'All Days (Mon - Sun)')}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors border border-slate-200/60"
        >
          8 AM - 9 PM (Daily)
        </button>
        <button
          type="button"
          onClick={() => handleApplyPreset('10:00', '19:00', 'Mon - Fri')}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors border border-slate-200/60"
        >
          10 AM - 7 PM (Mon-Fri)
        </button>
      </div>

      {/* Selected Time Preview Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 border border-indigo-100/90 rounded-xl text-xs font-bold text-indigo-900">
        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="text-slate-500 font-semibold text-[11px]">Selected:</span>
        <span className="text-indigo-700">{value || `${format24To12(startTime)} - ${format24To12(endTime)} (${days})`}</span>
      </div>
    </div>
  );
};
