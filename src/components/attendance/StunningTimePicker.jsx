import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, ChevronDown } from 'lucide-react';

/**
 * StunningTimePicker
 * Completely replaces the browser's native ugly <input type="time" /> popup
 * with a high-end, responsive time selector with custom rounded borders,
 * smooth AM/PM switches, and quick presets.
 */
export const StunningTimePicker = ({
  value = '09:00',
  onChange,
  name,
  label,
  placeholder = 'Select Time',
  isDarkMode = false,
  className = '',
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);

  // Parse initial 24h time ("09:00" or "18:30" or "09:00:00")
  const parseTime = (val) => {
    if (!val || typeof val !== 'string') {
      return { hour12: '09', minute: '00', period: 'AM' };
    }
    const clean = val.trim().split(':');
    let h = parseInt(clean[0] || '9', 10);
    let m = clean[1] ? clean[1].slice(0, 2) : '00';
    if (isNaN(h)) h = 9;
    
    let period = 'AM';
    if (h >= 12) {
      period = 'PM';
      if (h > 12) h -= 12;
    } else if (h === 0) {
      h = 12;
    }
    const hourStr = h < 10 ? `0${h}` : `${h}`;
    const minStr = m.padStart(2, '0');
    return { hour12: hourStr, minute: minStr, period };
  };

  const current = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(current.hour12);
  const [selectedMinute, setSelectedMinute] = useState(current.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(current.period);

  // Sync state when incoming value changes
  useEffect(() => {
    const parsed = parseTime(value);
    setSelectedHour(parsed.hour12);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
  }, [value]);

  // Outside click listener to auto-close
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Convert 12h + AM/PM -> 24h string "HH:MM"
  const emitChange = (h12, min, per) => {
    let h = parseInt(h12, 10);
    if (per === 'PM' && h < 12) h += 12;
    if (per === 'AM' && h === 12) h = 0;
    const final24 = `${h < 10 ? '0' + h : h}:${min}`;
    
    if (typeof onChange === 'function') {
      // Support both (val) => ... and (e) => ...
      onChange({
        target: { name: name || '', value: final24 },
        value: final24
      });
    }
  };

  const handleHourSelect = (h) => {
    setSelectedHour(h);
    emitChange(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m) => {
    setSelectedMinute(m);
    emitChange(selectedHour, m, selectedPeriod);
  };

  const handlePeriodSelect = (p) => {
    setSelectedPeriod(p);
    emitChange(selectedHour, selectedMinute, p);
  };

  const handlePresetSelect = (presetTime24) => {
    const parsed = parseTime(presetTime24);
    setSelectedHour(parsed.hour12);
    setSelectedMinute(parsed.minute);
    setSelectedPeriod(parsed.period);
    if (typeof onChange === 'function') {
      onChange({
        target: { name: name || '', value: presetTime24 },
        value: presetTime24
      });
    }
    setIsOpen(false);
  };

  // Formatted display string
  const displayFormatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  
  const presets = [
    { label: '08:00 AM', val: '08:00' },
    { label: '09:00 AM', val: '09:00' },
    { label: '10:00 AM', val: '10:00' },
    { label: '01:00 PM', val: '13:00' },
    { label: '05:00 PM', val: '17:00' },
    { label: '06:00 PM', val: '18:00' },
    { label: '10:00 PM', val: '22:00' }
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button - Clean styled container without default browser borders */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (!isOpen && containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const spaceAbove = rect.top;
              if (spaceBelow < 230 && spaceAbove >= 260) {
                setDropUp(true);
              } else {
                setDropUp(false);
              }
            }
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 outline-none select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'
        } ${
          isDarkMode
            ? isOpen
              ? 'bg-[#1e1e24] theme-border-primary ring-2 ring-[var(--primary-glow)] text-white'
              : 'bg-[#141417] border-[#27272a] hover:border-zinc-700 text-slate-200'
            : isOpen
              ? 'bg-white theme-border-primary ring-2 ring-[var(--primary-glow)] text-slate-900 shadow-sm'
              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg theme-bg-light theme-text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <span className="font-mono font-semibold tracking-wide">
            {value ? displayFormatted : <span className="text-slate-400 font-sans">{placeholder}</span>}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180 theme-text-primary' : 'text-slate-400'
        }`} />
      </button>

      {/* Custom Popup Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 ${dropUp ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'} z-[100] w-[310px] p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-[#18181b]/95 border-[#27272a] text-slate-100 shadow-black/60'
              : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-zinc-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Time
            </span>
            <div className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold theme-bg-light theme-text-primary">
              {displayFormatted}
            </div>
          </div>

          {/* 3 Columns: Hour, Minute, AM/PM */}
          <div className="grid grid-cols-3 gap-2">
            {/* Hour Column */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Hour
              </p>
              <div className="h-44 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {hoursList.map((h) => {
                  const isActive = selectedHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourSelect(h)}
                      className={`w-full py-1.5 text-xs font-mono font-semibold rounded-lg transition-all text-center ${
                        isActive
                          ? 'theme-bg-primary text-white shadow-md theme-shadow-primary font-bold'
                          : isDarkMode
                            ? 'text-slate-300 hover:bg-zinc-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute Column */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Min
              </p>
              <div className="h-44 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
                {minutesList.map((m) => {
                  const isActive = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinuteSelect(m)}
                      className={`w-full py-1.5 text-xs font-mono font-semibold rounded-lg transition-all text-center ${
                        isActive
                          ? 'theme-bg-primary text-white shadow-md theme-shadow-primary font-bold'
                          : isDarkMode
                            ? 'text-slate-300 hover:bg-zinc-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period Column (AM/PM) */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
                Period
              </p>
              <div className="flex flex-col gap-1.5">
                {['AM', 'PM'].map((p) => {
                  const isActive = selectedPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePeriodSelect(p)}
                      className={`w-full py-3 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1 ${
                        isActive
                          ? 'theme-bg-primary text-white shadow-md theme-shadow-primary font-extrabold'
                          : isDarkMode
                            ? 'bg-zinc-900/60 text-slate-300 border border-zinc-800 hover:bg-zinc-800'
                            : 'bg-slate-100/80 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Quick Select
            </p>
            <div className="flex flex-wrap gap-1">
              {presets.map((pr) => (
                <button
                  key={pr.val}
                  type="button"
                  onClick={() => handlePresetSelect(pr.val)}
                  className={`px-2 py-1 text-[11px] font-mono font-medium rounded-md transition-colors ${
                    isDarkMode
                      ? 'bg-zinc-800/70 hover:theme-bg-light hover:theme-text-primary text-slate-300'
                      : 'bg-slate-100 hover:theme-bg-light hover:theme-text-primary text-slate-600'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <div className="mt-3 pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold theme-bg-primary hover:opacity-90 text-white shadow-md theme-shadow-primary transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StunningTimePicker;
